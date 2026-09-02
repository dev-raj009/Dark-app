import { GraduationCap, MessageCircle, ArrowRight } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEnrollment } from "@/lib/enrollment";
import { LINKS } from "@/lib/uc";
import { TelegramIcon } from "@/components/site/Gate";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Learning — Unacademy Free Batches" },
      {
        name: "description",
        content:
          "Manage your enrolled courses, joined channels, preferences and free learning progress.",
      },
    ],
  }),
  component: ProfilePage,
});

export default function ProfilePage() {
  const { enrolled, unenroll } = useEnrollment();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="glass rounded-md p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="bg-brand-gradient grid h-20 w-20 shrink-0 place-items-center rounded-md text-3xl font-black text-white shadow-md">
            <GraduationCap className="h-7 w-7 text-emerald-500 mx-auto" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
              Free Learner Account
            </span>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Student Profile</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Daily free classes, recorded lectures, and notes synced across your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-emerald-600">{enrolled.length}</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Enrolled Courses</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-sky-600">50+</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Exam Goals</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-emerald-600">100%</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Free Access</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-indigo-600">HD</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Video & Notes</p>
        </div>
      </div>

      {/* Enrolled Courses Summary */}
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900">Enrolled Courses</h2>
            <p className="text-xs text-slate-500">Aapke sabhi active courses yahan dikhte hain</p>
          </div>
          <Link to="/my-courses" className="text-xs font-bold text-emerald-600 hover:underline">
            View All ({enrolled.length}) <ArrowRight className="h-4 w-4 inline ml-1" />
          </Link>
        </div>

        {enrolled.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">Abhi koi course enroll nahi kiya gaya.</p>
            <Link
              to="/courses"
              className="mt-3 inline-block rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {enrolled.slice(0, 5).map((c) => (
              <div key={c.uid} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    Enrolled {new Date(c.enrolledAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => unenroll(c.uid)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                  <Link
                    to="/course/$courseUid"
                    params={{ courseUid: c.uid }}
                    search={{ t: c.name }}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200"
                  >
                    Resume <ArrowRight className="h-4 w-4 inline ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Communities */}
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-sm font-bold text-slate-900">Official Communities</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Join WhatsApp aur Telegram channel for daily free PDF notes & notifications.
        </p>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-[#25d366] p-4 text-white shadow-xs transition-opacity hover:opacity-90 font-bold text-sm"
          >
            <MessageCircle className="h-4 w-4 text-[#25d366]" />
            <div>
              <p className="leading-none">Join WhatsApp Channel</p>
              <p className="text-xs text-white/80 font-normal mt-0.5">Instant Batch Updates</p>
            </div>
          </a>

          <a
            href={LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md p-4 text-white shadow-xs transition-opacity hover:opacity-90 font-bold text-sm"
            style={{ background: "#229ed9" }}
          >
            <TelegramIcon className="h-4 w-4 fill-current" />
            <div>
              <p className="leading-none">Join Telegram Channel</p>
              <p className="text-xs text-white/80 font-normal mt-0.5">PDFs & Lecture Links</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
