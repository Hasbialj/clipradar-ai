import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "ClipRadar AI — Find the Moments Worth Clipping",
  description:
    "AI-powered viral clip finder. Analyze long-form videos and automatically detect the most viral moments for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.",
  keywords: ["viral clips", "TikTok", "Reels", "YouTube Shorts", "AI video analysis", "ClipRadar"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[240px] min-h-screen overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
