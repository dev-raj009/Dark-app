import { useEffect } from "react";
import { X } from "lucide-react";

export default function PlayerModal({
  url,
  token,
  title,
  onClose,
}: {
  url?: string | null;
  token?: string | null;
  title: string;
  onClose: () => void;
}) {
  const targetUrl = url || token;

  useEffect(() => {
    if (!targetUrl) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [targetUrl, onClose]);

  if (!targetUrl) return null;

  const src = `/player.html?url=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-slate-950/95 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white/10 border-b border-white/15 backdrop-blur-2xl">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
          HD
        </span>
        <p className="flex-1 truncate font-display text-xs sm:text-sm font-bold text-white tracking-tight">
          {title}
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white transition-all hover:bg-white/20 active:scale-95 shadow-2xs backdrop-blur-md"
        >
          <X className="h-3.5 w-3.5" /> Close
        </button>
      </div>
      <iframe
        title="Lecture player"
        src={src}
        className="w-full flex-1 border-0"
        allow="fullscreen; autoplay; picture-in-picture"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
