import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SectionHead } from "@/components/site/Bits";
import { Search, X, Sparkles, RefreshCw } from "lucide-react";
import { GOALS } from "@/lib/uc";
import { CategoryIcon } from "@/lib/categoryIcons";
import { CategoryCircleSpinner, BrandLogo } from "@/components/site/CategoryLoader";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Exam Categories — Unacademy Free Batches" },
      {
        name: "description",
        content:
          "Browse all 50+ competitive exam categories with complete full names, free lectures, top educators and batches.",
      },
      { property: "og:title", content: "All Exam Categories — Unacademy Free Batches" },
      {
        property: "og:description",
        content:
          "Browse all exam categories with complete names, free lectures, top educators and batches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

const FEATURED_GOALS = [
  "KSCGY", // UPSC CSE
  "TMUVD", // IIT JEE
  "YOTUH", // NEET UG
  "VLEMN", // SSC
  "RTPSX", // Bank
  "PESHE", // GATE
  "XNDUS", // CAT
  "DANNJ", // NDA
  "GSZGO", // CBSE Class 10
  "PLWCX", // CBSE Class 12
  "QJEJG", // Railway
  "SIFWL", // IIT JAM
];

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  const categories = useMemo(() => {
    return Object.entries(GOALS).map(([uid, [name, emoji]]) => ({
      uid,
      name,
      emoji,
    }));
  }, []);

  // Simulate smooth loading of all 54 categories with circle spinner
  useEffect(() => {
    const total = categories.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 6;
      if (current >= total) {
        setLoadedCount(total);
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      } else {
        setLoadedCount(current);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [categories.length]);

  const featuredList = useMemo(() => {
    return FEATURED_GOALS.map((uid) => {
      const [name, emoji] = GOALS[uid] || ["Exam", ""];
      return { uid, name, emoji };
    });
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.uid.toLowerCase().includes(query.toLowerCase());
      const matchesLetter =
        selectedLetter === "ALL" || c.name.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesLetter;
    });
  }, [categories, query, selectedLetter]);

  const letters = [
    "ALL",
    ...Array.from(new Set(categories.map((c) => c.name[0]?.toUpperCase() || ""))).sort(),
  ];

  return (
    <div className="space-y-10 bg-white text-slate-900">
      {/* Top Banner (Glassmorphic) */}
      <div className="glass-container rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 shadow-2xs">
                Exam Streams ({categories.length})
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Loading streams...
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Exam <span className="text-gradient">Categories</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Sabhi 50+ competitive exams aur school boards ke free batches.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:max-w-xs">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exam (e.g. UPSC, JEE, SSC)..."
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Alphabet Filter Bar */}
        <div className="no-scrollbar mt-6 flex items-center gap-1.5 overflow-x-auto pb-1 relative">
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLetter(l)}
              className={`shrink-0 rounded-xl px-3 py-1.5 font-mono text-xs font-extrabold transition-all ${
                selectedLetter === l
                  ? "glass-button-emerald shadow-xs"
                  : "glass-button text-slate-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LOADING STATE WITH GOL GOL LOGO SPINNER ─── */}
      {isLoading ? (
        <div className="my-8 rounded-3xl glass-container p-10 text-center border border-emerald-100/70 shadow-xs animate-in fade-in duration-300">
          <CategoryCircleSpinner
            size="lg"
            label="Sabhi 50+ Categories Load Ho Rahi Hain..."
            count={loadedCount}
          />
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-400 transition-all duration-150"
                style={{
                  width: `${Math.min(100, Math.round((loadedCount / categories.length) * 100))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[10px] font-mono text-slate-400">
              {Math.min(100, Math.round((loadedCount / categories.length) * 100))}% Completed
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ─── Side-by-Side Scrolling Featured Categories ───────────────── */}
          <section className="space-y-4 animate-in fade-in duration-500">
            <SectionHead kicker="Top Picks" title="Featured Categories (Scroll Side-by-Side)" />
            <div className="no-scrollbar flex items-stretch gap-4 overflow-x-auto pb-3 pt-1">
              {featuredList.map((cat) => (
                <Link
                  key={`featured-${cat.uid}`}
                  to="/goal/$goalUid"
                  params={{ goalUid: cat.uid }}
                  className="group flex w-[220px] shrink-0 flex-col justify-between rounded-md border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-emerald-500 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform shadow-xs">
                      <CategoryIcon uid={cat.uid} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-xs font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700">
                        {cat.name}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400">UID: {cat.uid}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold text-emerald-600">
                    <span>View Free Batches</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ─── Full List of All Categories ─────────────────────────────── */}
          <section className="space-y-4 animate-in fade-in duration-500">
            <SectionHead
              kicker="All Goals"
              title={`Total Categories (${filtered.length})`}
              action={
                <span className="text-xs text-slate-500 font-mono">
                  Showing {filtered.length} of {categories.length} exams
                </span>
              }
            />

            {filtered.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Search className="h-7 w-7 text-slate-300 mx-auto mb-3" />
                <h3 className="mt-3 text-base font-bold text-slate-900">Koi category nahi mili</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Search query change karke dobara try karein.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedLetter("ALL");
                  }}
                  className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((cat, idx) => (
                  <Link
                    key={`${cat.uid}-${idx}`}
                    to="/goal/$goalUid"
                    params={{ goalUid: cat.uid }}
                    className="group flex items-center justify-between gap-3.5 rounded-2xl glass-card-interactive p-3.5 sm:p-4"
                  >
                    {/* Left Side: Number, Emoji & Full Category Name */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 group-hover:scale-105 transition-transform shadow-2xs">
                        <CategoryIcon uid={cat.uid} className="h-4.5 w-4.5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                            {cat.name}
                          </h3>
                          <span className="inline-block rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-500">
                            UID: {cat.uid}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Free batches, top educators & recorded lectures
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Action Button */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden rounded-xl glass-button px-3 py-1.5 text-xs font-extrabold text-emerald-700 sm:inline-flex items-center gap-1.5">
                        Explore Goal →
                      </span>
                      <span className="grid h-7 w-7 place-items-center rounded-xl glass-button text-xs font-bold text-emerald-700 sm:hidden">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
