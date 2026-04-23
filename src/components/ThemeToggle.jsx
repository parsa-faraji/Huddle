import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { val: "light", icon: Sun, label: "Light" },
  { val: "auto", icon: Monitor, label: "Auto" },
  { val: "dark", icon: Moon, label: "Dark" },
];

export default function ThemeToggle({ compact = false }) {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={clsx(
        "inline-flex items-center rounded-full p-1 text-sm",
        "bg-white/70 ring-1 ring-black/5",
        "dark:bg-white/10 dark:ring-white/10",
      )}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {OPTIONS.map(({ val, icon: Icon, label }) => {
        const active = pref === val;
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPref(val)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition cursor-pointer",
              "focus-visible:outline-none",
              active
                ? "bg-sky-950 text-white shadow dark:bg-[--huddle-gold] dark:text-slate-900"
                : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
            )}
          >
            <Icon size={14} aria-hidden="true" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
