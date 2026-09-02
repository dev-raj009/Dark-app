import { useEffect, useState } from "react";
import { Play, X, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";
import { LINKS } from "@/lib/uc";

/** WhatsApp join gate shown before every lecture playback. */
export function WhatsAppGate({
  open,
  title,
  onContinue,
  onClose,
}: {
  open: boolean;
  title: string;
  onContinue: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background Glow Circles */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-sky-500/15 blur-3xl" />

      {/* Frosted Glass Modal Box */}
      <div className="glass-modal relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-7 text-center shadow-2xl">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="glass-button absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-slate-500 hover:text-slate-900"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge & Animated Glow Icon */}
        <div className="relative mx-auto mb-3.5 mt-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#25d366]/20 to-emerald-400/20 border border-[#25d366]/30 shadow-inner">
          <MessageCircle className="h-8 w-8 text-[#25d366] fill-[#25d366]/20" />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-3 w-3" />
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 mb-2">
          <Sparkles className="h-3 w-3 text-emerald-600" /> Free Batch Updates
        </span>

        <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Join Official WhatsApp Channel
        </h3>

        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed px-2">
          Daily class links, PDF notes, and exam alerts directly on WhatsApp. Channel join karke
          bina kisi rukavat ke lecture continue karein.
        </p>

        {/* Lecture Title Card */}
        <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-2xs backdrop-blur-md">
          <p className="font-mono text-[10px] font-extrabold uppercase text-emerald-700">
            ▶ Selected Lecture:
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-900 leading-snug">
            {title || "Unacademy Free Batch Lecture"}
          </p>
        </div>

        {/* Sleek Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button-whatsapp flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-extrabold shadow-md"
          >
            <MessageCircle className="h-4.5 w-4.5 text-white fill-white/20" />
            Join WhatsApp Channel
          </a>

          <button
            onClick={onContinue}
            className="glass-button-emerald flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-extrabold shadow-sm"
          >
            <span>Continue to Video</span>
            <Play className="h-4 w-4 fill-white/80" />
          </button>
        </div>

        <p className="mt-4 text-[10px] font-medium text-slate-400">
          100% Free • Direct Access • No Ads
        </p>
      </div>
    </div>
  );
}

/** Floating Telegram popup — appears a few seconds after landing, once per session. */
export function TelegramPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("tg-popup")) return;
    const t = setTimeout(() => setShow(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem("tg-popup", "1");
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[350] w-[min(28rem,92vw)] -translate-x-1/2 px-1 animate-in slide-in-from-bottom-5 duration-300">
      <div className="glass-modal flex items-center gap-3 rounded-2xl p-3.5 shadow-xl border border-white/80">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 border border-sky-100/80">
          <TelegramIcon className="h-5 w-5 fill-[#229ed9]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-slate-900 leading-none">Join Telegram Channel</p>
          <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
            Daily lectures, PDFs & batch updates
          </p>
        </div>
        <a
          href={LINKS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button rounded-xl px-3.5 py-2 text-xs font-extrabold text-sky-700 hover:text-sky-800 shrink-0"
        >
          Join →
        </a>
        <button
          onClick={close}
          aria-label="Close popup"
          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="var(--telegram, #229ed9)">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
    </svg>
  );
}
