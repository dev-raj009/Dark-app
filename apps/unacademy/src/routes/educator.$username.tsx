import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { SectionHead, Skeletons, Empty } from "@/components/site/Bits";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { ucApi, type Course } from "@/lib/uc";

export const Route = createFileRoute("/educator/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — Free Courses & Lectures | Unacademy Free Batches` },
      {
        name: "description",
        content: `All free courses and recorded lectures by educator ${params.username} on Unacademy.`,
      },
      { property: "og:title", content: `${params.username} — Free Courses` },
      {
        property: "og:description",
        content: `Browse popular and latest free courses by ${params.username}.`,
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EducatorPage,
});

const PAGE = 20;

function EducatorPage() {
  const { username } = Route.useParams();
  const [type, setType] = useState<"popular" | "latest">("popular");
  const [page, setPage] = useState(0);

  const q = useQuery({
    queryKey: ["courses", username, type, page],
    queryFn: () => ucApi.courses(username, type, page * PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  const total = q.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  const thumb = (c: Course) => c.thumbnail || c.thumbnailV1 || "";
  const items = (c: Course) => c.itemCount ?? c.item_count ?? 0;
  const lang = (c: Course) => c.languageDisplay ?? c.language_display ?? "";

  return (
    <div className="space-y-8">
      <div className="glass rounded-md p-6">
        <Link to="/" className="text-xs font-bold text-primary">
          <ArrowLeft className="h-4 w-4 inline mr-1" /> Home
        </Link>
        <h1 className="mt-2 truncate text-3xl font-black sm:text-2xl">@{username}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total ? `${total} courses` : "Courses"} • free recorded lectures
        </p>
        <div className="mt-4 inline-flex rounded-md border border-border/60 p-1">
          {(["popular", "latest"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setPage(0);
              }}
              className={`rounded-md px-4 py-2 text-xs font-bold capitalize ${
                type === t ? "bg-brand-gradient text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <section>
        <SectionHead kicker="Courses" title="Free courses" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {q.isLoading ? (
            <Skeletons n={6} className="h-56" />
          ) : q.data?.results?.length ? (
            q.data.results.map((c, idx) => (
              <Link
                key={`${c.uid || idx}-${idx}`}
                to="/course/$courseUid"
                params={{ courseUid: c.uid }}
                search={{ t: c.name ?? "" }}
                className="glass glass-hover overflow-hidden rounded-md"
              >
                {thumb(c) ? (
                  <img
                    src={thumb(c)}
                    alt={c.name || "Course"}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-gradient h-40 w-full" />
                )}
                <div className="p-4">
                  <p className="line-clamp-2 font-display text-sm font-bold">
                    {c.name || "Untitled course"}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {items(c)} lessons {lang(c) ? `• ${lang(c)}` : ""}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <Empty
              icon={<BookOpen className="h-7 w-7 text-slate-300 mx-auto" />}
              text="Is educator ke courses abhi nahi mile."
            />
          )}
        </div>
      </section>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="glass rounded-md px-4 py-2 text-xs font-bold disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" /> Prev
          </button>
          <span className="font-mono text-xs text-muted-foreground">
            {page + 1} / {pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="glass rounded-md px-4 py-2 text-xs font-bold disabled:opacity-40"
          >
            Next <ArrowRight className="h-4 w-4 inline ml-1" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
