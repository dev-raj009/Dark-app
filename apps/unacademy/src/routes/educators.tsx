import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SectionHead, Skeletons, Empty } from "@/components/site/Bits";
import { ucApi, GOALS, teacherAvatar, teacherName } from "@/lib/uc";
import { CheckCircle2, ArrowRight, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/educators")({
  head: () => ({
    meta: [
      { title: "Top Educators — Unacademy Free Batches" },
      {
        name: "description",
        content: "Explore top educators across UPSC, JEE, NEET, SSC and 50+ exams on Unacademy.",
      },
    ],
  }),
  component: EducatorsPage,
});

const POPULAR_GOALS = [
  { uid: "KSCGY", name: "UPSC CSE" },
  { uid: "TMUVD", name: "IIT JEE" },
  { uid: "YOTUH", name: "NEET UG" },
  { uid: "VLEMN", name: "SSC Exams" },
  { uid: "RTPSX", name: "Bank Exams" },
  { uid: "PESHE", name: "GATE" },
  { uid: "XNDUS", name: "CAT" },
  { uid: "DANNJ", name: "NDA" },
];

export default function EducatorsPage() {
  const [selectedGoal, setSelectedGoal] = useState("KSCGY");
  const [search, setSearch] = useState("");

  const educators = useQuery({
    queryKey: ["teachers", selectedGoal, 0],
    queryFn: () => ucApi.teachers(selectedGoal, 0),
    staleTime: 5 * 60_000,
  });

  const list = educators.data?.results || [];

  const filtered = list.filter((t) => {
    const name = teacherName(t).toLowerCase();
    const topics = (t.topics_display || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || topics.includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Top Banner (Glassmorphic) */}
      <div className="glass-container rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Sparkles className="h-3 w-3 text-emerald-600" /> India&apos;s Best Faculty
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-3xl text-slate-900">
              Top <span className="text-gradient">Educators</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              UPSC, JEE, NEET aur sabhi competitive exams ke renowned teachers ke free courses.
            </p>
          </div>

          <div className="w-full md:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search educator name..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-xs sm:text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Goal Selector */}
        <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1 relative">
          {POPULAR_GOALS.map((g) => (
            <button
              key={g.uid}
              onClick={() => setSelectedGoal(g.uid)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                selectedGoal === g.uid ? "glass-button-emerald" : "glass-button text-slate-700"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Educators Directory Grid */}
      <section>
        <SectionHead
          kicker="Faculty Roster"
          title={`${GOALS[selectedGoal]?.[0] || "Exam"} Educators (${filtered.length})`}
        />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {educators.isLoading ? (
            <Skeletons n={8} className="h-64 rounded-2xl" />
          ) : filtered.length ? (
            filtered.map((t, idx) => (
              <Link
                key={`${t.username || t.uid || idx}-${idx}`}
                to="/educator/$username"
                params={{ username: (t.username || "").toLowerCase() }}
                className="group flex flex-col items-center justify-between rounded-2xl glass-card-interactive p-5 text-center relative"
              >
                {/* Avatar with Glow Ring & Check Badge */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={teacherAvatar(t)}
                    alt={teacherName(t)}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="relative h-22 w-22 sm:h-24 sm:w-24 rounded-2xl border-2 border-white object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow-md border-2 border-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="mt-3.5 w-full">
                  <h3 className="truncate font-display text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {teacherName(t)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug min-h-[30px]">
                    {t.topics_display || "Top Educator"}
                  </p>
                </div>

                <span className="mt-4 w-full rounded-xl bg-emerald-50/80 py-2.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-200/80 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200 inline-flex items-center justify-center gap-1">
                  View Courses <ArrowRight className="h-3.5 w-3.5 inline" />
                </span>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <Empty
                icon={<Users className="h-7 w-7 text-slate-300 mx-auto" />}
                text="Is category me abhi koi educator nahi mila."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
