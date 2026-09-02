import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { SectionHead, Skeletons, Empty } from "@/components/site/Bits";
import { ArrowLeft, ArrowRight, Users, BookOpen } from "lucide-react";
import { GOALS, goalName, ucApi, teacherAvatar, teacherName } from "@/lib/uc";
import { CategoryCircleSpinner } from "@/components/site/CategoryLoader";

export const Route = createFileRoute("/goal/$goalUid")({
  head: ({ params }) => {
    const name = GOALS[params.goalUid]?.[0] ?? "Goal";
    return {
      meta: [
        { title: `${name} — Free Educators & Lectures | Unacademy Free Batches` },
        {
          name: "description",
          content: `Browse top ${name} educators and their free Unacademy lectures, courses and live classes.`,
        },
        { property: "og:title", content: `${name} — Free Educators` },
        {
          property: "og:description",
          content: `Top ${name} educators and free lectures in one place.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: GoalPage,
});

const PAGE = 20;

function GoalPage() {
  const { goalUid } = Route.useParams();
  const [page, setPage] = useState(0);

  const q = useQuery({
    queryKey: ["teachers", goalUid, page],
    queryFn: () => ucApi.teachers(goalUid, page * PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  const total = q.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-8">
      <div className="glass rounded-md p-6">
        <Link to="/" className="text-xs font-bold text-primary">
          <ArrowLeft className="h-4 w-4 inline mr-1" /> Home
        </Link>
        <h1 className="mt-2 text-3xl font-black sm:text-2xl">
          <span className="mr-2">{GOALS[goalUid]?.[1] ?? ""}</span>
          {goalName(goalUid)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total ? `${total} educators` : "Educators"} • free lectures & courses
        </p>
      </div>

      <section>
        <SectionHead kicker="Educators" title="Top teachers" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {q.isLoading ? (
            <div className="col-span-full py-10">
              <CategoryCircleSpinner size="md" label="Loading Goal Educators..." />
            </div>
          ) : q.data?.results?.length ? (
            q.data.results.map((t, idx) => (
              <Link
                key={`${t.username || t.uid || idx}-${idx}`}
                to="/educator/$username"
                params={{ username: (t.username || "").toLowerCase() }}
                className="glass glass-hover rounded-md p-4 text-center"
              >
                <img
                  src={teacherAvatar(t)}
                  alt={teacherName(t)}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="mx-auto h-20 w-20 rounded-md border border-border object-cover"
                />
                <p className="mt-3 truncate font-display text-sm font-bold">{teacherName(t)}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {t.topics_display || "Educator"}
                </p>
                {t.followers_count ? (
                  <p className="mt-2 font-mono text-[10px] text-primary">
                    {t.followers_count.toLocaleString("en-IN")} followers
                  </p>
                ) : null}
              </Link>
            ))
          ) : (
            <Empty
              icon={<Users className="h-7 w-7 text-slate-300 mx-auto" />}
              text="Is goal ke educators abhi available nahi hain."
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
