import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import HeroMarquee from "@/components/site/HeroMarquee";
import { SectionHead, Skeletons, Empty } from "@/components/site/Bits";
import { CategoryIcon } from "@/lib/categoryIcons";
import { FullScreenBlurLoader } from "@/components/site/CategoryLoader";
import {
  GOALS,
  LINKS,
  ucApi,
  teacherAvatar,
  teacherName,
  type Course,
  type Teacher,
} from "@/lib/uc";
import { useEnrollment } from "@/lib/enrollment";
import { TelegramIcon } from "@/components/site/Gate";
import {
  GraduationCap,
  Star,
  BookOpen,
  Users,
  MessageCircle,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unacademy Free Batches — Live Classes, Top Educators & Free Lectures" },
      {
        name: "description",
        content:
          "Watch free Unacademy lectures for UPSC, JEE, NEET, SSC, Bank, GATE and 50+ exams. Browse top educators, 16:9 courses and interactive player.",
      },
      { property: "og:title", content: "Unacademy Free Batches" },
      {
        property: "og:description",
        content:
          "Free lectures for UPSC, JEE, NEET, SSC and more — top educators, courses and daily classes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

interface EnrichedCourse extends Course {
  categoryUid: string;
  categoryName: string;
  categoryEmoji: string;
  educator?: Teacher;
}

const FEATURED_CATEGORY_GOALS = [
  "KSCGY", // UPSC Civil Services
  "TMUVD", // IIT JEE Main & Advanced
  "YOTUH", // NEET UG
  "VLEMN", // SSC Exams
  "RTPSX", // Bank Exams
  "PESHE", // GATE & ESE
  "DANNJ", // NDA / Defense
  "PLWCX", // Class 12 Board
  "GSZGO", // Class 10 Board
  "DOKOV", // Programming & IT
];

const EDUCATOR_GOALS = ["KSCGY", "TMUVD", "YOTUH", "VLEMN", "RTPSX", "PESHE", "DANNJ", "GSZGO"];

const HOME_CATEGORY_BATCHES = [
  ["KSCGY", "TMUVD", "YOTUH", "VLEMN"],
  ["RTPSX", "PESHE", "XNDUS", "GSZGO"],
  ["DANNJ", "QJEJG", "SIFWL", "BIZXQ"],
  ["PLWCX", "GWDPZ", "SUVLV", "DOKOV"],
];

function Home() {
  const [courses, setCourses] = useState<EnrichedCourse[]>([]);
  const [currentBatchIdx, setCurrentBatchIdx] = useState(0);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMoreCourses, setHasMoreCourses] = useState(true);
  const { isEnrolled, toggle, count: enrolledCount } = useEnrollment();

  // Query 20 to 25 top educators across different categories
  const topEducatorsQuery = useQuery({
    queryKey: ["top25Teachers"],
    queryFn: async () => {
      const teacherMap = new Map<string, Teacher>();
      for (const goalUid of EDUCATOR_GOALS) {
        try {
          const res = await ucApi.teachers(goalUid, 0);
          if (res?.results) {
            for (const t of res.results) {
              if (t.username && !teacherMap.has(t.username.toLowerCase())) {
                teacherMap.set(t.username.toLowerCase(), t);
              }
            }
          }
        } catch (err) {
          console.warn("Failed fetching teachers for goal", goalUid, err);
        }
        if (teacherMap.size >= 25) break;
      }
      return Array.from(teacherMap.values()).slice(0, 25);
    },
    staleTime: 10 * 60_000,
  });

  // Load courses in batches with parallel execution & thumbnail preloading
  const loadCourseBatch = useCallback(async (batchIdx: number) => {
    if (batchIdx >= HOME_CATEGORY_BATCHES.length) {
      setHasMoreCourses(false);
      return;
    }
    setLoadingCourses(true);
    const targetGoals = HOME_CATEGORY_BATCHES[batchIdx];
    const newCourses: EnrichedCourse[] = [];
    const startTime = Date.now();

    try {
      // Parallel fast fetch for all target goals in this batch
      const goalResults = await Promise.allSettled(
        targetGoals.map(async (goalUid) => {
          const [goalName, goalEmoji] = GOALS[goalUid] || ["Exam", ""];
          try {
            const teacherRes = await ucApi.teachers(goalUid, 0);
            const topTeachers = teacherRes.results?.slice(0, 3) || [];

            const teacherCourses = await Promise.allSettled(
              topTeachers.map(async (teacher) => {
                if (!teacher.username) return [];
                try {
                  const cRes = await ucApi.courses(teacher.username, "popular", 0);
                  const tCourses = cRes.results?.slice(0, 2) || [];
                  return tCourses.map((c) => ({
                    ...c,
                    categoryUid: goalUid,
                    categoryName: goalName,
                    categoryEmoji: goalEmoji,
                    educator: teacher,
                  }));
                } catch {
                  return [];
                }
              }),
            );

            const goalCourseList: EnrichedCourse[] = [];
            for (const res of teacherCourses) {
              if (res.status === "fulfilled" && Array.isArray(res.value)) {
                goalCourseList.push(...res.value);
              }
            }
            return goalCourseList;
          } catch {
            return [];
          }
        }),
      );

      for (const gr of goalResults) {
        if (gr.status === "fulfilled" && Array.isArray(gr.value)) {
          newCourses.push(...gr.value);
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

      setCurrentBatchIdx(batchIdx);
      if (batchIdx + 1 >= HOME_CATEGORY_BATCHES.length) {
        setHasMoreCourses(false);
      }

      // If initial batch (batch 0), preload thumbnail images so they render immediately
      if (batchIdx === 0) {
        const thumbnailUrls = newCourses
          .map((c) => c.thumbnail || c.thumbnailV1 || c.educator?.avatar || "")
          .filter(Boolean);

        await Promise.allSettled(
          thumbnailUrls.slice(0, 20).map((url) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
              setTimeout(() => resolve(true), 1500);
            });
          }),
        );

        // Ensure loader is clearly visible for at least 800ms so animation is smooth
        const elapsed = Date.now() - startTime;
        const minVisibleTime = 850;
        if (elapsed < minVisibleTime) {
          await new Promise((r) => setTimeout(r, minVisibleTime - elapsed));
        }
      }
    } catch (e) {
      console.error("Batch load error:", e);
    } finally {
      setLoadingCourses(false);
      if (batchIdx === 0) {
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCourseBatch(0);

    // Fallback timer so user is never blocked
    const fallbackTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 4500);

    return () => clearTimeout(fallbackTimer);
  }, [loadCourseBatch]);

  const allCategories = Object.entries(GOALS).map(([uid, [name, emoji]]) => ({
    uid,
    name,
    emoji,
  }));

  const courseThumb = (c: Course) => c.thumbnail || c.thumbnailV1 || "";
  const courseItems = (c: Course) => c.itemCount ?? c.item_count ?? 0;

  // Horizontal scroll helper
  const scrollContainer = (id: string, direction: "left" | "right") => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmount = direction === "left" ? -320 : 320;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-14 bg-white text-slate-900 relative">
      {/* ─── POPUP MODAL LOADER WITH ROTATING LOGO ─── */}
      <FullScreenBlurLoader show={initialLoading} />
      {/* ─── Top Prominent Action Buttons / Pills (Ultra-Glassmorphic) ─────────────────────────── */}
      <section className="pt-2">
        <div className="no-scrollbar flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1">
          <Link
            to="/courses"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button-emerald px-3.5 py-2 text-xs font-black"
          >
            <GraduationCap className="h-4 w-4" /> View All Courses
          </Link>

          <Link
            to="/my-courses"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button px-3.5 py-2 text-xs font-bold text-slate-800"
          >
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>My Courses</span>
            {enrolledCount > 0 ? (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-black text-white shadow-xs">
                {enrolledCount}
              </span>
            ) : null}
          </Link>

          <Link
            to="/categories"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button px-3.5 py-2 text-xs font-bold text-slate-800"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>All Categories</span>
          </Link>

          <Link
            to="/educators"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button px-3.5 py-2 text-xs font-bold text-slate-800"
          >
            <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Top Educators</span>
          </Link>

          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button px-3.5 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25d366] fill-[#25d366]/20 shrink-0" />
            <span>WhatsApp Channel</span>
          </a>

          <a
            href={LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl glass-button px-3.5 py-2 text-xs font-bold text-sky-800 hover:text-sky-900"
          >
            <TelegramIcon className="h-3.5 w-3.5 fill-[#229ed9] shrink-0" />
            <span>Telegram Channel</span>
          </a>
        </div>
      </section>

      {/* ─── Hero Section with Marquee ──────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 border border-emerald-200 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> 100% Free • Unacademy Batches
          </span>
          <h1 className="mt-4 text-2xl sm:text-4xl font-black leading-[1.1] text-slate-900 tracking-tight">
            India&apos;s Best Free Classes,{" "}
            <span className="text-gradient">Sabhi Exams Ke Liye</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-slate-600">
            UPSC, JEE, NEET, SSC, Bank, GATE aur 50+ categories ke top educators ke recorded
            lectures with notes.
          </p>
        </div>

        {/* Auto-scrolling Hero Banner Carousel */}
        <HeroMarquee courses={courses} />
      </section>

      {/* ─── 1. EXPLORE COURSES SECTION (Horizontal Scroll Rows per Category) ──── */}
      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">
              Explore Courses
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Category-wise Free Batches
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Swipe left and right on any category to browse its free courses.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            <span>All Courses</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loop through each Featured Category to render a Horizontal Course Row */}
        {FEATURED_CATEGORY_GOALS.map((goalUid) => {
          const [catName] = GOALS[goalUid] || ["Goal", ""];
          const categoryCourses = courses.filter((c) => c.categoryUid === goalUid);
          const displayCourses = categoryCourses.length > 0 ? categoryCourses : courses.slice(0, 5);
          const containerId = `cat-courses-${goalUid}`;

          return (
            <div key={`cat-row-${goalUid}`} className="space-y-3">
              {/* Category Header with Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                    <CategoryIcon uid={goalUid} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {catName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">Free Lectures & Notes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(containerId, "left")}
                    className="hidden sm:grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(containerId, "right")}
                    className="hidden sm:grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <Link
                    to="/goal/$goalUid"
                    params={{ goalUid }}
                    className="text-xs font-bold text-emerald-600 hover:underline ml-1"
                  >
                    View Goal →
                  </Link>
                </div>
              </div>

              {/* Horizontal Scrollable Course Row */}
              <div
                id={containerId}
                className="no-scrollbar flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
              >
                {loadingCourses && courses.length === 0 ? (
                  <div className="flex gap-4">
                    <div className="w-[280px] h-[320px] rounded-xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="w-[280px] h-[320px] rounded-xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="w-[280px] h-[320px] rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  </div>
                ) : (
                  displayCourses.map((c, idx) => {
                    const enrolled = isEnrolled(c.uid);
                    return (
                      <div
                        key={`cat-course-${goalUid}-${c.uid}-${idx}`}
                        className="group flex w-[275px] sm:w-[310px] shrink-0 flex-col overflow-hidden rounded-2xl glass-card-interactive"
                      >
                        {/* 16:9 Thumbnail Header */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                          {courseThumb(c) ? (
                            <img
                              src={courseThumb(c)}
                              alt={c.name || "Course"}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="bg-brand-gradient flex h-full w-full items-center justify-center p-4 text-center font-display text-xs font-bold text-white">
                              {c.name || catName}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                          <div className="absolute left-3 top-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white backdrop-blur-md border border-white/20">
                              <CategoryIcon uid={goalUid} className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{catName}</span>
                            </span>
                          </div>

                          {courseItems(c) > 0 ? (
                            <div className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                              <PlayCircle className="h-3 w-3 inline mr-1 text-emerald-400" />
                              {courseItems(c)} Lectures
                            </div>
                          ) : null}
                        </div>

                        {/* Content Body & Buttons */}
                        <div className="flex flex-1 flex-col p-4">
                          <h4 className="line-clamp-2 font-display text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                            {c.name || `${catName} Comprehensive Batch`}
                          </h4>

                          {c.educator ? (
                            <div className="mt-2.5 flex items-center gap-2">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                {c.educator.first_name?.[0] || "U"}
                              </span>
                              <p className="truncate text-xs font-semibold text-slate-700">
                                {teacherName(c.educator)}
                              </p>
                            </div>
                          ) : null}

                          {/* Action Buttons */}
                          <div className="mt-auto pt-3.5 flex items-center gap-2 border-t border-slate-100">
                            <button
                              onClick={() =>
                                toggle({
                                  uid: c.uid,
                                  name: c.name || "Course",
                                  thumbnail: courseThumb(c),
                                  categoryName: catName,
                                  categoryEmoji: "",
                                  educatorName: c.educator ? teacherName(c.educator) : undefined,
                                  itemCount: courseItems(c),
                                })
                              }
                              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                                enrolled
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-black shadow-2xs"
                                  : "glass-button text-slate-800"
                              }`}
                            >
                              {enrolled ? "✓ Enrolled" : "+ Enroll"}
                            </button>

                            <Link
                              to="/course/$courseUid"
                              params={{ courseUid: c.uid }}
                              search={{ t: c.name ?? "" }}
                              className="glass-button-emerald inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-xs"
                            >
                              Explore →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── 2. TOP EDUCATORS CAROUSEL (Ultra-Premium Glass Box) ──── */}
      <section className="space-y-5 rounded-3xl glass-container p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow orb behind */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Sparkles className="h-3 w-3 text-emerald-600" /> Faculty Spotlight
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Top 20+ Educators Across India
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Swipe horizontally to view India&apos;s most popular teachers across UPSC, JEE, NEET,
              SSC, Bank & GATE.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollContainer("educators-carousel", "left")}
              className="glass-button h-9 w-9 grid place-items-center rounded-xl text-slate-700"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollContainer("educators-carousel", "right")}
              className="glass-button h-9 w-9 grid place-items-center rounded-xl text-slate-700"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/educators"
              className="glass-button px-3.5 py-2 rounded-xl text-xs font-extrabold text-emerald-700 hover:text-emerald-800 ml-1"
            >
              All Teachers →
            </Link>
          </div>
        </div>

        {/* 20-25 Teachers Horizontal Scroll Container */}
        <div
          id="educators-carousel"
          className="no-scrollbar flex items-stretch gap-4 overflow-x-auto pb-3 pt-2 scroll-smooth relative"
        >
          {topEducatorsQuery.isLoading ? (
            <div className="flex gap-4">
              <Skeletons n={6} className="w-[185px] h-[240px] shrink-0 rounded-2xl" />
            </div>
          ) : topEducatorsQuery.data?.length ? (
            topEducatorsQuery.data.map((t, idx) => (
              <Link
                key={`${t.username || idx}-${idx}`}
                to="/educator/$username"
                params={{ username: (t.username || "").toLowerCase() }}
                className="group flex w-[175px] sm:w-[200px] shrink-0 flex-col items-center justify-between rounded-2xl glass-card-interactive p-4 text-center relative"
              >
                {/* Ranking Tag */}
                <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-100/90 px-2 py-0.5 font-mono text-[9px] font-black text-slate-500 border border-slate-200/80">
                  #{idx + 1}
                </span>

                {/* Avatar with Glow Ring */}
                <div className="relative mt-2">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={teacherAvatar(t)}
                    alt={teacherName(t)}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-2xl border-2 border-white object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow-md border-2 border-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Teacher Info */}
                <div className="mt-3.5 w-full">
                  <p className="truncate font-display text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {teacherName(t)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug min-h-[30px]">
                    {t.topics_display || "Top Educator"}
                  </p>
                </div>

                {/* Action Link Button */}
                <span className="mt-3.5 w-full rounded-xl bg-emerald-50/80 py-2 text-[10px] font-extrabold text-emerald-800 border border-emerald-200/80 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200">
                  Explore Courses →
                </span>
              </Link>
            ))
          ) : (
            <Empty
              icon={<Users className="h-7 w-7 text-slate-400 mx-auto" />}
              text="Educators abhi available nahi hain."
            />
          )}
        </div>
      </section>

      {/* ─── 3. FEATURED CATEGORIES SECTION (With Real Lucide Icons for All) ──── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">
              Exam Streams
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              50+ Categories with Real Exam Icons
            </h2>
          </div>
          <Link to="/categories" className="text-xs font-bold text-emerald-600 hover:underline">
            All ({allCategories.length}) Categories →
          </Link>
        </div>

        {/* Horizontal Scrollable Category Cards with Real Icons */}
        <div className="no-scrollbar flex items-stretch gap-4 overflow-x-auto pb-3 pt-1">
          {allCategories.map((cat) => (
            <Link
              key={`home-cat-${cat.uid}`}
              to="/goal/$goalUid"
              params={{ goalUid: cat.uid }}
              className="group flex w-[230px] shrink-0 flex-col justify-between rounded-2xl glass-card-interactive p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform shadow-xs">
                  <CategoryIcon uid={cat.uid} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-xs font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400">UID: {cat.uid}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2.5 text-[11px] font-extrabold text-emerald-700">
                <span>Explore Free Batches</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Community CTA (WhatsApp & Telegram Glass Banner) ──────────────────────── */}
      <section className="rounded-3xl glass-container p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black sm:text-3xl text-slate-900 tracking-tight relative">
          Roz naye batches, sabse pehle
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-600 relative">
          Telegram aur WhatsApp channel join karein — free batch notes, daily class links aur exam
          alerts ke liye.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 relative">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl glass-button px-5 py-3 text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-2.5"
          >
            <MessageCircle className="h-4.5 w-4.5 text-[#25d366] fill-[#25d366]/20" /> Join WhatsApp
            Channel
          </a>
          <a
            href={LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl glass-button px-5 py-3 text-xs sm:text-sm font-extrabold text-sky-700 hover:text-sky-800 flex items-center gap-2.5"
          >
            <TelegramIcon className="h-4.5 w-4.5 fill-[#229ed9]" />
            Join Telegram Channel
          </a>
        </div>
      </section>
    </div>
  );
}
