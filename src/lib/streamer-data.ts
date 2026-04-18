import { prisma } from "@/lib/prisma";
import { CampaignResponse } from "@/app/types";

interface LeaderboardRow {
  user_id: bigint;
  email: string | null;
  wagering: number | null;
  deposits: number | null;
  rank: bigint | null;
}

const CAMPAIGN_TIMEZONE = "Australia/Sydney";

/**
 * Converts a DB date (date-only, returned as midnight UTC by Prisma)
 * into a proper UTC ISO string, interpreting the date in the campaign timezone.
 * e.g. end_date 2026-03-15 → 2026-03-15T23:59:59 AEDT → 2026-03-15T12:59:59Z
 */
function toUtcIso(dbDate: Date, time: "start" | "end"): string {
  const dateStr = dbDate.toISOString().slice(0, 10);
  const timeStr = time === "start" ? "00:00:00" : "23:59:59";

  const utcGuess = new Date(`${dateStr}T${timeStr}Z`);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPAIGN_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(utcGuess);

  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const tzTimeStr = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`;
  const offsetMs = new Date(tzTimeStr).getTime() - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offsetMs).toISOString();
}

function maskUsername(email: string | null, userId: bigint): string {
  if (!email) return `user***${userId.toString().slice(-3)}`;
  const name = email.split("@")[0];
  if (name.length <= 3) return `${name}***`;
  return `${name.slice(0, 3)}***${name.slice(-2)}`;
}

function parsePid(pid: string): { masked: boolean; digits: string } | null {
  const digits = pid.replace(/\D/g, "");
  if (!digits) return null;
  const masked = pid.includes("*");
  if (masked && digits.length < 3) return null;
  return { masked, digits };
}

export async function getCampaignData(slug: string, pid?: string): Promise<CampaignResponse | null> {
  const streamer = await prisma.streamer.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      stag: true,
      avatarMimeType: true,
      prizes: true,
      registrationUrl: true,
      loginUrl: true,
      ctaUrl: true,
      campaignId: true,
      termsAndConditionsHtml: true,
    },
  });

  if (!streamer) return null;

  const campaign = streamer.campaignId
    ? await prisma.leaderboard_campaign.findFirst({
        where: { campaign_id: BigInt(streamer.campaignId) },
        orderBy: { end_date: "desc" },
      })
    : null;

  let players: { id: string; rank: number; username: string; wagered: number; deposited: number }[] = [];
  if (campaign) {
    const entryMinDep = campaign.entry_min_dep ?? 0;
    const entryMinWgr = campaign.entry_min_wgr ?? 0;

    const rows = await prisma.$queryRaw<LeaderboardRow[]>`
      SELECT user_id, email, wagering, deposits, rank
      FROM leaderboard_influencer
      WHERE campaign_id = ${campaign.campaign_id}
        AND COALESCE(deposits, 0) >= ${entryMinDep}
        AND COALESCE(wagering, 0) >= ${entryMinWgr}
      ORDER BY rank ASC
      LIMIT 10
    `;

    players = rows.map((row, i) => ({
      id: row.user_id.toString(),
      rank: row.rank ? Number(row.rank) : i + 1,
      username: maskUsername(row.email, row.user_id),
      wagered: row.wagering ? Number(row.wagering) : 0,
      deposited: row.deposits ? Number(row.deposits) : 0,
    }));
  }

  let currentPlayer: CampaignResponse["leaderboard"]["currentPlayer"] = null;
  if (campaign && pid) {
    const parsed = parsePid(pid);
    if (parsed) {
      const entryMinDep = campaign.entry_min_dep ?? 0;
      const entryMinWgr = campaign.entry_min_wgr ?? 0;
      const suffix = `%${parsed.digits.slice(-3)}`;

      const matchRows = parsed.masked
        ? await prisma.$queryRaw<LeaderboardRow[]>`
            SELECT user_id, email, wagering, deposits, rank
            FROM leaderboard_influencer
            WHERE campaign_id = ${campaign.campaign_id}
              AND COALESCE(deposits, 0) >= ${entryMinDep}
              AND COALESCE(wagering, 0) >= ${entryMinWgr}
              AND user_id::text LIKE ${suffix}
            ORDER BY rank ASC
            LIMIT 1
          `
        : await prisma.$queryRaw<LeaderboardRow[]>`
            SELECT user_id, email, wagering, deposits, rank
            FROM leaderboard_influencer
            WHERE campaign_id = ${campaign.campaign_id}
              AND COALESCE(deposits, 0) >= ${entryMinDep}
              AND COALESCE(wagering, 0) >= ${entryMinWgr}
              AND user_id = ${BigInt(parsed.digits)}
            LIMIT 1
          `;

      const row = matchRows[0];
      if (row) {
        currentPlayer = {
          id: row.user_id.toString(),
          rank: row.rank ? Number(row.rank) : 0,
          username: maskUsername(row.email, row.user_id),
          wagered: row.wagering ? Number(row.wagering) : 0,
          deposited: row.deposits ? Number(row.deposits) : 0,
        };
      }
    }
  }

  const now = new Date();
  const hasAvatar = !!streamer.avatarMimeType;
  const prizes = (streamer.prizes || {}) as Record<string, string>;

  // Determine which top-3 players are eligible for the podium based on prize minimums
  const prizeMinThresholds: Record<number, { minWgr: number; minDep: number }> = {
    1: { minWgr: campaign?.prize1_min_wgr ?? 0, minDep: campaign?.prize1_min_dep ?? 0 },
    2: { minWgr: campaign?.prize2_min_wgr ?? 0, minDep: campaign?.prize2_min_dep ?? 0 },
    3: { minWgr: campaign?.prize3_min_wgr ?? 0, minDep: campaign?.prize3_min_dep ?? 0 },
  };

  const podiumPlayers = players.slice(0, 3).filter((player) => {
    const thresholds = prizeMinThresholds[player.rank];
    if (!thresholds) return true;
    return player.wagered >= thresholds.minWgr && player.deposited >= thresholds.minDep;
  });

  return {
    streamer: {
      name: streamer.name,
      avatarUrl: hasAvatar ? `/api/streamers/${streamer.id}/avatar` : "",
      bannerUrl: "/assets/banner.png",
      stag: streamer.stag,
      registrationUrl: streamer.registrationUrl || "",
      loginUrl: streamer.loginUrl || "",
      ctaUrl: streamer.ctaUrl || "",
      termsAndConditionsHtml: streamer.termsAndConditionsHtml || "",
    },
    campaign: {
      startDate: campaign?.start_date
        ? toUtcIso(campaign.start_date, "start")
        : null,
      endDate: campaign?.end_date
        ? toUtcIso(campaign.end_date, "end")
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usePointsTerminology: false,
      firstPrizeUnlockThreshold: campaign?.prize1_min_wgr ?? 0,
      prizes: {
        ...(prizes["1st"] && { 1: prizes["1st"] }),
        ...(prizes["2nd"] && { 2: prizes["2nd"] }),
        ...(prizes["3rd"] && { 3: prizes["3rd"] }),
      },
    },
    leaderboard: {
      lastUpdated: new Date(Math.floor(now.getTime() / (15 * 60000)) * 15 * 60000).toISOString(),
      nextUpdate: new Date((Math.floor(now.getTime() / (15 * 60000)) + 1) * 15 * 60000).toISOString(),
      players,
      podiumPlayers,
      currentPlayer,
    },
  };
}
