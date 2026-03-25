import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const streamers = await prisma.streamer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      avatarMimeType: true,
      stag: true,
      prizes: true,
      registrationUrl: true,
      loginUrl: true,
      ctaUrl: true,
      campaignId: true,
      termsAndConditionsHtml: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = streamers.map((s) => ({
    ...s,
    hasAvatar: !!s.avatarMimeType,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const slugRaw = formData.get("slug") as string | null;
  const stag = formData.get("stag") as string;
  const prizesRaw = formData.get("prizes") as string | null;
  const registrationUrl = formData.get("registrationUrl") as string | null;
  const loginUrl = formData.get("loginUrl") as string | null;
  const ctaUrl = formData.get("ctaUrl") as string | null;
  const campaignId = formData.get("campaignId") as string | null;
  const termsAndConditionsHtml = formData.get("termsAndConditionsHtml") as string | null;
  const avatarFile = formData.get("avatar") as File | null;

  if (!name || !stag || !campaignId) {
    return NextResponse.json(
      { error: "name, stag, and campaignId are required" },
      { status: 400 }
    );
  }

  const slug = slugRaw?.trim() || slugify(name);
  let prizes = {};
  if (prizesRaw) {
    try {
      prizes = JSON.parse(prizesRaw);
    } catch {
      return NextResponse.json(
        { error: "prizes must be valid JSON" },
        { status: 400 }
      );
    }
  }

  let avatar: Uint8Array<ArrayBuffer> | undefined;
  let avatarMimeType: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const arrayBuffer = await avatarFile.arrayBuffer();
    avatar = Buffer.from(arrayBuffer);
    avatarMimeType = avatarFile.type;
  }

  try {
    const streamer = await prisma.streamer.create({
      data: {
        name,
        slug,
        stag,
        prizes,
        registrationUrl: registrationUrl || null,
        loginUrl: loginUrl || null,
        ctaUrl: ctaUrl || null,
        campaignId,
        termsAndConditionsHtml: termsAndConditionsHtml || null,
        ...(avatar && { avatar, avatarMimeType }),
      },
    });

    return NextResponse.json(
      { id: streamer.id, name: streamer.name, slug: streamer.slug },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A streamer with this name already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
}
