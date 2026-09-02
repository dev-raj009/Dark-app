import { BookOpen, PlayCircle } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SectionHead, Skeletons } from "@/components/site/Bits";
import { GOALS, ucApi, teacherName, type Course, type Teacher } from "@/lib/uc";
import { useEnrollment } from "@/lib/enrollment";
import { CategoryCircleSpinner } from "@/components/site/CategoryLoader";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Explore All Courses & Batches — Unacademy Free Batches" },
      {
        name: "description",
        content:
          "Browse 100% free courses and batches across UPSC, JEE, NEET, SSC, GATE, Banking, Class 10, Class 12 with 16:9 lecture previews.",
      },
      { property: "og:title", content: "Explore All Courses & Batches" },
      {
        property: "og:description",
        content: "Watch free recorded courses with lecture previews, slides and PDF notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

interface EnrichedCourse extends Course {
  categoryUid: string;
  categoryName: string;
  categoryEmoji: string;
  educator?: Teacher;
}

const CATEGORY_BATCHES = [
  ["KSCGY", "TMUVD", "YOTUH", "VLEMN"], // Batch 1: UPSC, JEE, NEET, SSC
  ["RTPSX", "PESHE", "XNDUS", "GSZGO"], // Batch 2: Bank, GATE, CAT, Class 10
  ["DANNJ", "QJEJG", "SIFWL", "BIZXQ"], // Batch 3: NDA, Railway, IIT JAM, CSIR NET
  ["PLWCX", "GWDPZ", "SUVLV", "DOKOV"], // Batch 4: Class 12, Class 11, Class 9, Programming
  ["TEWDQ", "DZVHL", "BBKWG", "MRZFY"], // Batch 5: NTA NET, IELTS, CA, Law
  ["QOIVT", "SCANJ", "XCTVJ", "GWDPV"], // Batch 6: BPSC, RPSC, UPPSC, MPPSC
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<EnrichedCourse[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { isEnrolled, toggle } = useEnrollment();

  const loadBatch = useCallback(async (batchIdx: number) => {
    if (batchIdx >= CATEGORY_BATCHES.length) {
      setHasMore(false);
      return;
    }

    setLoading(true);
    const targetGoals = CATEGORY_BATCHES[batchIdx];
    const newCourses: EnrichedCourse[] = [];

    try {
      // For each goal in the batch, fetch educators and their top courses
      for (const goalUid of targetGoals) {
        const [goalName, goalEmoji] = GOALS[goalUid] || ["Goal", ""];
        try {
          const teacherRes = await ucApi.teachers(goalUid, 0);
          const topTeachers = teacherRes.results?.slice(0, 3) || [];

          for (const teacher of topTeachers) {
            if (!teacher.username) continue;
            try {
              const courseRes = await ucApi.courses(teacher.username, "popular", 0);
              const teacherCourses = courseRes.results?.slice(0, 2) || [];

              teacherCourses.forEach((c) => {
                newCourses.push({
                  ...c,
                  categoryUid: goalUid,
                  categoryName: goalName,
                  categoryEmoji: goalEmoji,
                  educator: teacher,
                });
              });
            } catch (e) {
              console.warn("Failed fetching courses for educator", teacher.username, e);
            }
          }
        } catch (e) {
          console.warn("Failed fetching teachers for goal", goalUid, e);
        }
      }

      setCourses((prev) => {
        const seen = new Set<string>();
        const combined = [...prev, ...newCourses];
        const uniqueList: EnrichedCourse[] = [];
        for (const c of combined) {
          if (c && c.uid && !seen.has(c.uid)) {
            seen.add(c.uid);
            uniqueList.push(c);
          }
        }
        return uniqueList;
      });

      setCurrentBatchIndex(batchIdx);
      if (batchIdx + 1 >= CATEGORY_BATCHES.length) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading course batch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBatch(0);
  }, [loadBatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadBatch(currentBatchIndex + 1);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesGoal = selectedGoal === "ALL" || c.categoryUid === selectedGoal;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.categoryName.toLowerCase().includes(q) ||
      teacherName(c.educator || {})
        .toLowerCase()
        .includes(q);
    return matchesGoal && matchesSearch;
  });

  const thumb = (c: Course) => c.thumbnail || c.thumbnailV1 || "";
  const itemsCount = (c: Course) => c.itemCount ?? c.item_count ?? 0;
  const lang = (c: Course) => c.languageDisplay ?? c.language_display ?? "Hindi/English";

  return (
    <div className="space-y-8">
      {/* Top Banner (Glassmorphic) */}
      <div className="glass-container rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 shadow-2xs">
              Direct Course Batches
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              All <span className="text-gradient">Courses & Batches</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Sabhi category ke recorded lectures, notes aur batches — 16:9 thumbnail previews ke
              saath.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course, subject, or educator..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Quick Goal Filter Badges */}
        <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1 relative">
          <button
            onClick={() => setSelectedGoal("ALL")}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
              selectedGoal === "ALL"
                ? "glass-button-emerald shadow-xs"
                : "glass-button text-slate-700"
            }`}
          >
            All Categories ({courses.length})
          </button>
          {[
            { uid: "KSCGY", name: "UPSC" },
            { uid: "TMUVD", name: "IIT JEE" },
            { uid: "YOTUH", name: "NEET UG" },
            { uid: "VLEMN", name: "SSC" },
            { uid: "RTPSX", name: "Bank" },
            { uid: "PESHE", name: "GATE" },
            { uid: "XNDUS", name: "CAT" },
            { uid: "GSZGO", name: "Class 10" },
            { uid: "PLWCX", name: "Class 12" },
            { uid: "DANNJ", name: "NDA" },
          ].map((g) => (
            <button
              key={g.uid}
              onClick={() => setSelectedGoal(g.uid)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                selectedGoal === g.uid
                  ? "glass-button-emerald shadow-xs"
                  : "glass-button text-slate-700"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid: 16:9 Aspect Ratio Cards */}
      <section>
        <SectionHead
          kicker="Course Catalog"
          title={`Available Courses (${filteredCourses.length})`}
          action={
            <span className="text-xs text-slate-500 font-mono">
              Batch {currentBatchIndex + 1} of {CATEGORY_BATCHES.length} loaded
            </span>
          }
        />

        {courses.length === 0 && loading ? (
          <div className="rounded-3xl glass-container py-16 px-4 text-center">
            <CategoryCircleSpinner size="lg" label="Loading 16:9 Courses & Batches..." />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-container rounded-3xl p-12 text-center">
            <BookOpen className="h-7 w-7 text-slate-400 mx-auto mb-3" />
            <h3 className="mt-3 text-base font-bold text-slate-900">Koi course nahi mila</h3>
            <p className="mt-1 text-xs text-slate-500">
              Search query change karke ya neeche &quot;Load More&quot; par click karein.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c, idx) => (
              <div
                key={`${c.uid}-${idx}`}
                className="group flex flex-col overflow-hidden rounded-2xl glass-card-interactive"
              >
                {/* 16:9 Thumbnail Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {thumb(c) ? (
                    <img
                      src={thumb(c)}
                      alt={c.name || "Course Thumbnail"}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-brand-gradient flex h-full w-full items-center justify-center p-4 text-center font-display text-sm font-bold text-white">
                      {c.name || "Unacademy Course"}
                    </div>
                  )}

                  {/* Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white backdrop-blur-md border border-white/20">
                      {c.categoryEmoji} {c.categoryName.split("(")[0].trim()}
                    </span>
                  </div>

                  {/* Lesson Count Pill */}
                  {itemsCount(c) > 0 ? (
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                      <PlayCircle className="h-3 w-3 inline mr-1 text-emerald-400" />{" "}
                      {itemsCount(c)} Lectures
                    </div>
                  ) : null}
                </div>

                {/* Card Content Area */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 font-display text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {c.name || "Comprehensive Course"}
                  </h3>

                  {/* Educator info */}
                  {c.educator ? (
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-extrabold text-emerald-700 border border-emerald-100">
                        {c.educator.first_name?.[0] || "U"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-slate-900">
                          {teacherName(c.educator)}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {c.educator.topics_display || "Top Educator"}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() =>
                        toggle({
                          uid: c.uid,
                          name: c.name || "Course",
                          thumbnail: thumb(c),
                          categoryName: c.categoryName,
                          categoryEmoji: c.categoryEmoji,
                          educatorName: c.educator ? teacherName(c.educator) : undefined,
                          itemCount: itemsCount(c),
                        })
                      }
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                        isEnrolled(c.uid)
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black shadow-2xs"
                          : "glass-button text-slate-800"
                      }`}
                    >
                      {isEnrolled(c.uid) ? "✓ Enrolled" : "+ Enroll"}
                    </button>

                    {/* Explore Course Button */}
                    <Link
                      to="/course/$courseUid"
                      params={{ courseUid: c.uid }}
                      search={{ t: c.name ?? "" }}
                      className="glass-button-emerald inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-xs"
                    >
                      Explore →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Spinner / Skeleton during batch fetch */}
        {loading && courses.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeletons n={3} className="h-72 rounded-2xl" />
          </div>
        ) : null}

        {/* Load More Courses Action Button */}
        {hasMore ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="glass-button-emerald group flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs sm:text-sm font-black shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Loading Courses...
                </>
              ) : (
                <>
                  <span>Load More Courses</span>
                  <span className="transition-transform group-hover:translate-y-0.5">↓</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 font-mono">
              Click to load more batches across 50+ categories
            </p>
          </div>
        ) : courses.length > 0 ? (
          <div className="mt-10 text-center">
            <p className="glass-button inline-block rounded-full px-5 py-2 font-mono text-xs text-slate-600">
              ✓ Sabhi categories ke courses load ho chuke hain
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
