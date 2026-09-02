import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { GOALS, LINKS } from "@/lib/uc";
import { useTheme } from "@/lib/theme";
import { useEnrollment } from "@/lib/enrollment";
import { TelegramIcon, TelegramPopup } from "./Gate";
import BottomNav from "./BottomNav";
import { CategoryIcon } from "@/lib/categoryIcons";
import { BrandLogo } from "./CategoryLoader";
import {
  Sun,
  Moon,
  X,
  MessageCircle,
  Menu,
  Home,
  GraduationCap,
  BookMarked,
  LayoutGrid,
  Users,
  Search,
  ChevronRight,
  Database,
} from "lucide-react";

const QUICK = ["KSCGY", "TMUVD", "YOTUH", "VLEMN", "RTPSX", "PESHE", "XNDUS", "GSZGO"];

function Logo({ size = 32 }: { size?: number }) {
  return <BrandLogo size={size} showGlow={true} />;
}

export default function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const { theme, toggle } = useTheme();
  const { count: enrolledCount } = useEnrollment();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  if (currentPath === "/watch") return <main className="w-full h-screen bg-black">{children}</main>;

  const navItems = [
    { label: "Home", to: "/", active: currentPath === "/", icon: Home },
    { label: "Courses", to: "/courses", active: currentPath === "/courses", icon: GraduationCap },
    {
      label: "My Courses",
      to: "/my-courses",
      active: currentPath === "/my-courses",
      badge: enrolledCount > 0 ? enrolledCount : undefined,
      icon: BookMarked,
    },
    {
      label: "Categories",
      to: "/categories",
      active: currentPath === "/categories" || currentPath.startsWith("/goal/"),
      icon: LayoutGrid,
    },
    {
      label: "Educators",
      to: "/educators",
      active: currentPath === "/educators" || currentPath.startsWith("/educator/"),
      icon: Users,
    },
  ];

  const filteredGoals = Object.entries(GOALS).filter(([_, [name]]) =>
    name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  return (
    <div className="relative z-10 min-h-screen bg-white text-slate-900">
      {/* ─── Top Navigation Header (Glassmorphic) ────────────────────────────────────── */}
      <header className="sticky top-0 z-[200] md:px-3 md:pt-3">
        <div className="mx-auto flex max-w-6xl items-center gap-3 md:rounded-2xl border-b md:border border-slate-200/80 bg-white/80 px-4 py-2.5 md:py-2 shadow-xs backdrop-blur-xl">
          <button
            onClick={() => setOpen(true)}
            className="glass-button h-9 w-9 grid place-items-center rounded-xl text-slate-800 -ml-1 active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Logo & Brand ("Unacademy") */}
          <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
            <Logo size={28} />
            <span className="min-w-0">
              <span className="block truncate font-display text-base sm:text-sm font-black leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                Unacademy
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-bold mt-0.5">
                Free Batches
              </span>
            </span>
          </Link>

          {/* Primary Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                  item.active ? "glass-button-emerald shadow-xs" : "glass-button text-slate-700"
                }`}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[9px] font-black text-slate-950">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          {/* Right actions: Join WhatsApp, Join Telegram, Theme */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl glass-button px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex"
            >
              <MessageCircle className="h-4 w-4 text-[#25d366] fill-[#25d366]/20" />
              WhatsApp
            </a>

            <a
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-xl glass-button px-3 py-1.5 text-xs font-bold text-sky-700 lg:flex"
            >
              <TelegramIcon className="h-4 w-4 fill-[#229ed9]" />
              Telegram
            </a>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-xl glass-button text-slate-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Slide-out Navigation Drawer Menu (Ultra-Glassmorphic) ─────────────────────────── */}
      <div
        className={`fixed inset-0 z-[800] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 flex h-full w-[88vw] max-w-sm flex-col rounded-r-3xl glass-drawer p-5 transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header with Unacademy Branding */}
          <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
            <Logo size={28} />
            <div>
              <p className="font-display text-base font-black leading-none text-slate-900">
                Unacademy
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-bold mt-1">
                Learn Free Daily
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto glass-button grid h-8 w-8 place-items-center rounded-xl text-slate-600"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Drawer Links */}
          <div className="mt-4 space-y-1.5">
            <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-700 px-1 mb-2">
              Navigation Menu
            </p>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold transition-all ${
                    item.active ? "glass-button-emerald shadow-md" : "glass-button text-slate-800"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg ${item.active ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 font-mono text-[10px] font-black text-slate-950 shadow-xs">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 opacity-50 ${item.active ? "text-white opacity-80" : "text-slate-400"}`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Social Channel Join Buttons */}
          <div className="mt-4 space-y-2 pt-3 border-t border-slate-200/80">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl glass-button px-3.5 py-2.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-900"
            >
              <MessageCircle className="h-4.5 w-4.5 text-[#25d366] fill-[#25d366]/20 shrink-0" />
              <span>Join WhatsApp Channel</span>
            </a>
            <a
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl glass-button px-3.5 py-2.5 text-xs font-extrabold text-sky-800 hover:text-sky-900"
            >
              <TelegramIcon className="h-4.5 w-4.5 fill-[#229ed9] shrink-0" />
              <span>Join Telegram Channel</span>
            </a>
          </div>

          {/* All Categories & Exams Header & Search */}
          <div className="mt-4 flex items-center justify-between px-1">
            <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-700">
              Exams & Stream ({filteredGoals.length})
            </p>
            <Link
              to="/categories"
              onClick={() => setOpen(false)}
              className="text-[11px] font-extrabold text-emerald-600 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="mt-2 relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Search 50+ categories..."
              className="w-full rounded-xl glass-button pl-8 pr-3 py-2 text-xs outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Scrollable Category List in Drawer */}
          <nav className="no-scrollbar mt-2 flex-1 space-y-1 overflow-y-auto pb-6">
            {filteredGoals.map(([uid, [name]]) => (
              <Link
                key={uid}
                to="/goal/$goalUid"
                params={{ goalUid: uid }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 transition-all hover:bg-white/80 hover:border hover:border-emerald-300 hover:text-emerald-700"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <CategoryIcon uid={uid} className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{name}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {/* ─── Page Main Content ────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <div>
              <p className="font-display font-extrabold leading-none text-slate-900">Unacademy</p>
              <p className="text-xs text-slate-500">Free lectures & study material</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {QUICK.map((u) => (
              <Link
                key={u}
                to="/goal/$goalUid"
                params={{ goalUid: u }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {GOALS[u]?.[0]}
              </Link>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-xs text-slate-500">
          Educational content is aggregated for learning purposes only. All trademarks belong to
          their respective owners.
        </p>
      </footer>

      <TelegramPopup />
      <BottomNav />
    </div>
  );
}
