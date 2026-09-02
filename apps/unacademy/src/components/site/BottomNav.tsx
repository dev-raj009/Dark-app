import { Link, useRouterState } from "@tanstack/react-router";
import { useEnrollment } from "@/lib/enrollment";
import { Home, GraduationCap, Library, User } from "lucide-react";

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { count: enrolledCount } = useEnrollment();

  const isHome = currentPath === "/";
  const isCourses = currentPath === "/courses";
  const isCategories = currentPath === "/categories" || currentPath.startsWith("/goal/");
  const isProfile = currentPath === "/profile" || currentPath === "/my-courses";

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[190] border-t border-slate-200/80 bg-white/85 backdrop-blur-xl pb-2 shadow-[0_-4px_25px_-10px_rgba(15,23,42,0.1)]">
      <nav aria-label="Bottom Navigation" className="flex items-center justify-around px-2 py-1.5">
        {/* Home */}
        <Link
          to="/"
          className={`group flex flex-col items-center gap-1 rounded-md px-2 py-1.5 transition-all ${
            isHome ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span
            className={`transition-transform group-active:scale-90 ${isHome ? "drop-shadow-sm" : ""}`}
          >
            <Home className="h-4 w-4" />
          </span>
          <span className={`text-[10px] tracking-tight ${isHome ? "font-bold" : "font-medium"}`}>
            Home
          </span>
        </Link>

        {/* Courses */}
        <Link
          to="/courses"
          className={`group flex flex-col items-center gap-1 rounded-md px-2 py-1.5 transition-all ${
            isCourses ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span
            className={`transition-transform group-active:scale-90 ${isCourses ? "drop-shadow-sm" : ""}`}
          >
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className={`text-[10px] tracking-tight ${isCourses ? "font-bold" : "font-medium"}`}>
            Courses
          </span>
        </Link>

        {/* Categories */}
        <Link
          to="/categories"
          className={`group flex flex-col items-center gap-1 rounded-md px-2 py-1.5 transition-all ${
            isCategories ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span
            className={`transition-transform group-active:scale-90 ${isCategories ? "drop-shadow-sm" : ""}`}
          >
            <Library className="h-4 w-4" />
          </span>
          <span
            className={`text-[10px] tracking-tight ${isCategories ? "font-bold" : "font-medium"}`}
          >
            Categories
          </span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`group relative flex flex-col items-center gap-1 rounded-md px-2 py-1.5 transition-all ${
            isProfile ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {enrolledCount > 0 && !isProfile ? (
            <span className="absolute -top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 font-mono text-[9px] font-black text-white shadow-xs">
              {enrolledCount}
            </span>
          ) : null}
          <span
            className={`transition-transform group-active:scale-90 ${isProfile ? "drop-shadow-sm" : ""}`}
          >
            <User className="h-4 w-4" />
          </span>
          <span className={`text-[10px] tracking-tight ${isProfile ? "font-bold" : "font-medium"}`}>
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
