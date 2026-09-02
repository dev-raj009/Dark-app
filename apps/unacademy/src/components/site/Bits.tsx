import type { ReactNode } from "react";

export function SectionHead({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {kicker ? (
          <div className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            {kicker}
          </div>
        ) : null}
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Skeletons({ n = 6, className = "h-32" }: { n?: number; className?: string }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`shimmer rounded-md ${className}`} />
      ))}
    </>
  );
}

export function Empty({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="glass col-span-full rounded-md px-4 py-8 text-center">
      <div className="mb-3 text-2xl">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
