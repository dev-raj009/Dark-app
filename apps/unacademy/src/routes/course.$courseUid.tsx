import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SectionHead, Skeletons, Empty } from "@/components/site/Bits";
import { ArrowLeft, PlayCircle, FileText } from "lucide-react";
import { WhatsAppGate } from "@/components/site/Gate";
import { ucApi, LINKS, type Lecture } from "@/lib/uc";
import { useEnrollment } from "@/lib/enrollment";

export const Route = createFileRoute("/course/$courseUid")({
  validateSearch: (s: Record<string, unknown>) => ({
    t: typeof s.t === "string" ? s.t.slice(0, 140) : "",
  }),
  head: ({ params }) => ({
    meta: [
      { title: "Course lectures — Unacademy Free Batches" },
      {
        name: "description",
        content: `Watch all free recorded lectures of this Unacademy course (${params.courseUid}) with notes and PDFs.`,
      },
      { property: "og:title", content: "Course lectures — Unacademy Free Batches" },
      {
        property: "og:description",
        content: "All free recorded lectures with slides and PDFs.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { courseUid } = Route.useParams();
  const { t } = Route.useSearch();
  const navigate = useNavigate();
  const { isEnrolled, toggle } = useEnrollment();
  const [pending, setPending] = useState<{ lecture: Lecture; index: number } | null>(null);

  const q = useQuery({
    queryKey: ["lectures", courseUid],
    queryFn: () => ucApi.lectures(courseUid),
    staleTime: 5 * 60_000,
  });

  const enrolled = isEnrolled(courseUid);

  const fmt = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "";

  const handleStartPlay = (lecture: Lecture, index: number) => {
    const targetUrl = lecture.video_url || lecture.token;
    if (targetUrl) {
      window.open(`/player.html?url=${encodeURIComponent(targetUrl)}`, "_blank");
    }
  };

  return (
    <div className="space-y-8">
      {/* Course Header Banner */}
      <div className="glass rounded-md p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 inline mr-1" /> Back to Courses
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              {t || "Course Lectures"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {q.data?.results?.length ?? 0} Recorded Lectures • Free HD Streaming & Synced Notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                toggle({
                  uid: courseUid,
                  name: t || "Unacademy Course",
                  itemCount: q.data?.results?.length,
                })
              }
              className={`rounded-md px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm ${
                enrolled
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
              }`}
            >
              {enrolled ? "✓ Enrolled in Course" : "+ Enroll Course"}
            </button>

            {q.data?.results?.[0] ? (
              <button
                onClick={() => setPending({ lecture: q.data.results[0], index: 0 })}
                className="bg-brand-gradient rounded-md px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                <PlayCircle className="h-4 w-4 inline mr-1" /> Start Learning
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Lectures List */}
      <section>
        <SectionHead kicker="Curriculum" title="All Lectures & Notes" />
        <div className="space-y-3 mt-4">
          {q.isLoading ? (
            <Skeletons n={6} className="h-20" />
          ) : q.data?.results?.length ? (
            q.data.results.map((l, i) => (
              <div
                key={`${l.title}-${i}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{l.title}</p>
                  <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                    {l.author} {l.started_at ? `• ${fmt(l.started_at)}` : ""}
                  </p>
                </div>

                {l.pdf ? (
                  <a
                    href={l.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <FileText className="h-3 w-3" /> PDF
                  </a>
                ) : null}

                <button
                  disabled={!l.video_url && !l.token}
                  onClick={() => setPending({ lecture: l, index: i })}
                  className="shrink-0 flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
                >
                  <PlayCircle className="h-3 w-3" /> Play
                </button>
              </div>
            ))
          ) : (
            <Empty
              icon={<PlayCircle className="h-7 w-7 text-slate-300 mx-auto" />}
              text="Is course ke lectures abhi available nahi hain."
            />
          )}
        </div>
      </section>

      {/* WhatsApp verification gate before starting */}
      <WhatsAppGate
        open={!!pending}
        title={pending?.lecture.title ?? ""}
        onClose={() => setPending(null)}
        onContinue={() => {
          if (pending) {
            handleStartPlay(pending.lecture, pending.index);
            setPending(null);
          }
        }}
      />
    </div>
  );
}
