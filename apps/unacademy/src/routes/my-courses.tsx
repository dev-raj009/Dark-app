import { createFileRoute, Link } from "@tanstack/react-router";
import { useEnrollment } from "@/lib/enrollment";
import { SectionHead } from "@/components/site/Bits";
import { GraduationCap, BookOpen, PlayCircle, ArrowRight } from "lucide-react";
import { LINKS } from "@/lib/uc";

export const Route = createFileRoute("/my-courses")({
  head: () => ({
    meta: [
      { title: "My Enrolled Courses — Unacademy Free Batches" },
      {
        name: "description",
        content: "Access all your enrolled courses, lectures and continue learning anytime.",
      },
    ],
  }),
  component: MyCoursesPage,
});

export default function MyCoursesPage() {
  const { enrolled, unenroll } = useEnrollment();

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass rounded-md p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
              Personal Learning
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-2xl text-slate-900">
              My <span className="text-gradient">Enrolled Courses</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Aapke saved aur enrolled courses — directly click karke padhai continue karein.
            </p>
          </div>

          <Link
            to="/courses"
            className="bg-brand-gradient inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs sm:text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            + Explore More Courses
          </Link>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <section>
        <SectionHead kicker="Active Courses" title={`Enrolled Courses (${enrolled.length})`} />

        {enrolled.length === 0 ? (
          <div className="glass rounded-md p-12 text-center border border-slate-200 bg-white shadow-xs">
            <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Abhi koi course enroll nahi kiya
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Home ya Courses page par jakar kisi bhi course ke &quot;Enroll&quot; button par click
              karein.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/courses"
                className="bg-brand-gradient rounded-md px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
              >
                Browse All Courses
              </Link>
              <Link
                to="/"
                className="rounded-md border border-slate-200 bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolled.map((c) => (
              <div
                key={c.uid}
                className="glass glass-hover group flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition-all hover:border-emerald-500/40 hover:shadow-lg"
              >
                {/* 16:9 Thumbnail / Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-brand-gradient flex h-full w-full items-center justify-center p-4 text-center font-display text-sm font-bold text-white">
                      {c.name}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white backdrop-blur-md">
                      <BookOpen className="inline w-3 h-3 mr-1" /> {c.categoryName || "Enrolled"}
                    </span>
                  </div>

                  {c.itemCount ? (
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2.5 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                      <PlayCircle className="h-3 w-3 inline mr-1" /> {c.itemCount} Lectures
                    </div>
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-display text-base font-extrabold text-slate-900 leading-snug">
                    {c.name}
                  </h3>

                  {c.educatorName ? (
                    <p className="mt-2 text-xs font-bold text-slate-600">
                      Educator: {c.educatorName}
                    </p>
                  ) : null}

                  <p className="mt-1 text-[10px] text-slate-400 font-mono">
                    Enrolled on {new Date(c.enrolledAt).toLocaleDateString("en-IN")}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => unenroll(c.uid)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Unenroll
                    </button>

                    <Link
                      to="/course/$courseUid"
                      params={{ courseUid: c.uid }}
                      search={{ t: c.name }}
                      className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                    >
                      Continue Learning <ArrowRight className="h-4 w-4 inline ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
