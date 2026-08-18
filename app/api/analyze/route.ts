import { NextRequest, NextResponse } from "next/server";
import { analyzeMockVideo } from "@/lib/ai/mockAnalyzer";
import ytdl from "@distube/ytdl-core";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fileName } = body;

    if (!url && !fileName) {
      return NextResponse.json(
        { error: "Provide a YouTube URL or file name." },
        { status: 400 }
      );
    }

    let detectedTitle = fileName || "Video";
    let detectedDuration = 1800; // default 30 mins

    // Extract real YouTube title and duration if valid YouTube URL
    if (url && ytdl.validateURL(url)) {
      try {
        const info = await ytdl.getBasicInfo(url);
        detectedTitle = info.videoDetails.title || detectedTitle;
        detectedDuration = parseInt(info.videoDetails.lengthSeconds, 10) || detectedDuration;
      } catch (ytErr) {
        console.warn("Could not fetch YouTube info via ytdl, falling back:", ytErr);
      }
    }

    // Collect progress events
    const progressLog: Array<{ step: string; progress: number; message: string }> = [];
    const onProgress = (step: string, progress: number, message: string) => {
      progressLog.push({ step, progress, message });
    };

    const result = await analyzeMockVideo(
      { url, fileName: detectedTitle, durationSeconds: detectedDuration },
      onProgress
    );

    // Ensure title matches detected real YouTube title
    result.videoMetadata.title = detectedTitle;
    result.videoMetadata.durationSeconds = detectedDuration;

    return NextResponse.json({ result, progressLog });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
