/**
 * One-time script to backfill campaignId on existing streamers
 * by looking up leaderboard_campaign via their stag value.
 *
 * Usage: npx tsx scripts/backfill-campaign-ids.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const streamers = await prisma.streamer.findMany({
    where: { campaignId: null },
    select: { id: true, name: true, stag: true },
  });

  console.log(`Found ${streamers.length} streamers without campaignId`);

  for (const s of streamers) {
    const campaign = await prisma.leaderboard_campaign.findFirst({
      where: { influencer_stag: parseInt(s.stag, 10) },
      orderBy: { end_date: "desc" },
    });

    if (campaign) {
      const campaignIdStr = campaign.campaign_id.toString();
      await prisma.streamer.update({
        where: { id: s.id },
        data: { campaignId: campaignIdStr },
      });
      console.log(`  ${s.name} (stag=${s.stag}) → campaignId=${campaignIdStr}`);
    } else {
      console.log(`  ${s.name} (stag=${s.stag}) → no campaign found, skipping`);
    }
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
