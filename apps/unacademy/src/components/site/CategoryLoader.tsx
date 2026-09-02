export const UNACADEMY_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMoD260MXEH1aYOimogVz-ZN5bBDHcEJlfXcDX4dbHJg&s=10";

export function BrandLogo({
  size = 32,
  className = "",
  showGlow = false,
}: {
  size?: number;
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden bg-white shadow-xs border border-slate-200/80 p-0.5 ${
        showGlow ? "ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={UNACADEMY_LOGO_URL}
        alt="Unacademy Logo"
        loading="eager"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-xl select-none"
      />
    </div>
  );
}

export function CategoryCircleSpinner({
  size = "md",
  label = "Loading categories...",
  count,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  count?: number;
}) {
  const sizeMap = {
    sm: { container: "h-20 w-20", logo: 36, stroke: "h-20 w-20" },
    md: { container: "h-28 w-28", logo: 48, stroke: "h-28 w-28" },
    lg: { container: "h-36 w-36", logo: 64, stroke: "h-36 w-36" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center">
      {/* ─── Circular Gol Gol Rotating Ring with Center Logo ─── */}
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Outer pulsating ambient glow */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />

        {/* Outer Rotating Conic / Gradient Ring */}
        <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-emerald-500 border-r-sky-500 border-b-emerald-400 animate-spin" />

        {/* Counter-rotating dashed accent ring */}
        <div
          className="absolute -inset-1.5 rounded-full border border-dashed border-emerald-400/40 animate-spin"
          style={{ animationDuration: "6s", animationDirection: "reverse" }}
        />

        {/* Center Logo Card */}
        <div className="relative z-10 rounded-2xl bg-white p-1 shadow-md border border-emerald-100 flex items-center justify-center transition-transform hover:scale-105">
          <BrandLogo size={currentSize.logo} showGlow={false} />
        </div>
      </div>

      {/* Label and Progress text */}
      <div className="space-y-1 max-w-xs">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{label}</span>
        </div>
        {count !== undefined ? (
          <p className="text-[11px] font-mono text-slate-500">
            {count} / 50+ categories synchronized
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">Sabhi categories load ho rahi hain...</p>
        )}
      </div>
    </div>
  );
}

export function FullScreenBlurLoader({
  show,
  title = "Loading Batches & Courses",
  subtitle = "Sare courses aur thumbnails load ho rahe hain...",
  statusText = "SYNCHRONIZING CONTENT",
}: {
  show: boolean;
  title?: string;
  subtitle?: string;
  statusText?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in select-none">
      {/* ─── Centered Floating Popup Card ─── */}
      <div className="relative w-full max-w-[320px] sm:max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-emerald-100 dark:border-slate-800 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Subtle decorative top aura */}
        <div className="absolute -top-10 inset-x-0 mx-auto h-20 w-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        {/* ─── Gol Gol Multi-layer Spinner with Center Logo ─── */}
        <div className="relative flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 mb-5">
          {/* Pulsing Emerald Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />

          {/* Primary High-Speed Rotating Conic Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-sky-400 border-b-emerald-400 animate-spin"
            style={{ animationDuration: "1s" }}
          />

          {/* Secondary Reverse Counter-Spin Gradient Ring */}
          <div
            className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-sky-400 border-l-emerald-500 animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          />

          {/* Outer Dashed Orbit Ring */}
          <div
            className="absolute -inset-3 rounded-full border border-dashed border-emerald-400/50 animate-spin"
            style={{ animationDuration: "6s" }}
          />

          {/* Center Logo Box */}
          <div className="relative z-10 rounded-2xl bg-white p-1.5 shadow-md border border-emerald-100 flex items-center justify-center">
            <BrandLogo size={52} showGlow={false} />
          </div>
        </div>

        {/* ─── Status Badge & Title ─── */}
        <div className="space-y-1.5 w-full">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-0.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{statusText}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-normal px-2">
            {subtitle}
          </p>
        </div>

        {/* ─── Animated Progress Indicator ─── */}
        <div className="mt-5 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-inner">
          <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 to-emerald-500 animate-pulse" />
        </div>
        <span className="mt-2 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
          Courses • Thumbnails • Batches
        </span>
      </div>
    </div>
  );
}
