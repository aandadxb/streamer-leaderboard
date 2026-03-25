import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const streamerId = parseInt(slug, 10);
  if (isNaN(streamerId)) {
    return new NextResponse(null, { status: 404 });
  }

  const streamer = await prisma.streamer.findUnique({
    where: { id: streamerId },
    select: { avatar: true, avatarMimeType: true },
  });

  if (!streamer || !streamer.avatar) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(streamer.avatar, {
    headers: {
      "Content-Type": streamer.avatarMimeType || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
