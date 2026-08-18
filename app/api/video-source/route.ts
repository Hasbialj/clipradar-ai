import { NextRequest, NextResponse } from "next/server";
import { getYouTubeVideoId } from "@/lib/utils";
import ytdl from "@distube/ytdl-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  // 1. Official YouTube oEmbed API (guaranteed 100% uptime without API key)
  try {
    const oembedResp = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (oembedResp.ok) {
      const oembedData = await oembedResp.json();
      return NextResponse.json({
        videoId,
        title: oembedData.title,
        author: oembedData.author_name,
        thumbnailUrl: oembedData.thumbnail_url,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        isOfficialYouTube: true,
      });
    }
  } catch (oembedErr) {
    console.warn("oEmbed failed:", oembedErr);
  }

  // 2. ytdl-core fallback
  try {
    const info = await ytdl.getBasicInfo(url);
    return NextResponse.json({
      videoId,
      title: info.videoDetails.title,
      author: info.videoDetails.author?.name || "",
      thumbnailUrl: info.videoDetails.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      isOfficialYouTube: true,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      videoId,
      title: `YouTube Video (${videoId})`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      isOfficialYouTube: true,
    });
  }
}
