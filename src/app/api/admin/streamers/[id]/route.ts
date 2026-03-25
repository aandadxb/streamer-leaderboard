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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const streamerId = parseInt(id, 10);
  if (isNaN(streamerId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

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
  const removeAvatar = formData.get("removeAvatar") === "true";
  const avatarFile = formData.get("avatar") as File | null;



  if (!name || !stag) {
    return NextResponse.json(
      { error: "name and stag are required" },
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

  const updateData: Record<string, unknown> = {
    name,
    slug,
    stag,
    prizes,
    registrationUrl: registrationUrl || null,
    loginUrl: loginUrl || null,
    ctaUrl: ctaUrl || null,
    campaignId: campaignId || null,
    termsAndConditionsHtml: termsAndConditionsHtml || null,
  };

  if (removeAvatar) {
    updateData.avatar = null;
    updateData.avatarMimeType = null;
  } else if (avatarFile && avatarFile.size > 0) {
    const arrayBuffer = await avatarFile.arrayBuffer();
    updateData.avatar = Buffer.from(arrayBuffer);
    updateData.avatarMimeType = avatarFile.type;
  }

  try {
    const streamer = await prisma.streamer.update({
      where: { id: streamerId },
      data: updateData,
    });

    return NextResponse.json({
      id: streamer.id,
      name: streamer.name,
      slug: streamer.slug,
    });
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
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Streamer not found" },
        { status: 404 }
      );
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const streamerId = parseInt(id, 10);
  if (isNaN(streamerId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.streamer.delete({ where: { id: streamerId } });
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Streamer not found" },
        { status: 404 }
      );
    }
    throw error;
  }
}
