import clsx from "clsx";
import { useToastList } from "../context/ToastContext";

export default function ToastStack() {
  const toasts = useToastList();
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))] pointer-events-none"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={clsx(
            "pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur-md animate-[huddle-toast-in_.18s_ease-out]",
            t.kind === "success" &&
              "bg-emerald-500/95 text-white ring-emerald-600/40",
            t.kind === "error" && "bg-rose-500/95 text-white ring-rose-600/40",
            t.kind === "info" && "bg-slate-900/95 text-white ring-slate-950/30",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
