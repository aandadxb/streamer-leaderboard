import { NextRequest, NextResponse } from "next/server";
import { getCampaignData } from "@/lib/streamer-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getCampaignData(slug);

  if (!data) {
    return NextResponse.json({ error: "Streamer not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
