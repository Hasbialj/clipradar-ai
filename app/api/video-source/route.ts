import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highest",
      filter: "audioandvideo",
    });

    return NextResponse.json({
      title: info.videoDetails.title,
      durationSeconds: parseInt(info.videoDetails.lengthSeconds, 10),
      thumbnailUrl: info.videoDetails.thumbnails?.[0]?.url || "",
      directStreamUrl: format?.url || "",
      author: info.videoDetails.author?.name || "",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch YouTube info";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
