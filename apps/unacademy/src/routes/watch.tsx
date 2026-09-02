import { ArrowLeft, MessageCircle, PlayCircle, ArrowRight, FileText, Play } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { ucApi, LINKS, type Lecture } from "@/lib/uc";
import { useEnrollment } from "@/lib/enrollment";
import { TelegramIcon } from "@/components/site/Gate";

interface WatchSearchParams {
  courseUid?: string;
  videoUrl?: string;
  lecIdx?: number;
  t?: string;
  courseTitle?: string;
}

export const Route = createFileRoute("/watch")({
  validateSearch: (s: Record<string, unknown>): WatchSearchParams => ({
    courseUid: typeof s.courseUid === "string" ? s.courseUid : undefined,
    videoUrl: typeof s.videoUrl === "string" ? s.videoUrl : undefined,
    lecIdx: typeof s.lecIdx === "number" ? s.lecIdx : Number(s.lecIdx || 0),
    t: typeof s.t === "string" ? s.t : undefined,
    courseTitle: typeof s.courseTitle === "string" ? s.courseTitle : undefined,
  }),
  head: ({ search }: { search: { t?: string } }) => ({
    meta: [
      { title: `${search?.t || "Watch Lecture"} — Unacademy Free Batches` },
      {
        name: "description",
        content:
          "Watch high quality interactive Unacademy video lectures with synced whiteboard notes and slides.",
      },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const search = Route.useSearch();
  const activeVideoUrl = search.videoUrl || "";

  useEffect(() => {
    if (activeVideoUrl) {
      window.location.replace(activeVideoUrl);
    }
  }, [activeVideoUrl]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] px-4">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Redirecting to Video...</h1>
        {activeVideoUrl ? (
          <p className="text-sm text-slate-500">
            If you are not redirected automatically,{" "}
            <a href={activeVideoUrl} className="text-emerald-600 underline font-semibold">
              click here
            </a>
            .
          </p>
        ) : (
          <p className="text-sm text-red-500">No video URL provided.</p>
        )}
        <Link to="/" className="inline-block mt-4 text-xs font-bold text-slate-600 hover:underline">
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
