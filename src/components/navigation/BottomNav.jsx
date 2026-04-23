import { useLocation, useNavigate } from "react-router-dom";
import { Map, Users, BarChart3, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/study-spots", icon: Map, label: "Spots", alt: "Study spots" },
  { to: "/study-groups", icon: Users, label: "Groups", alt: "Study groups" },
  { to: "/insights", icon: BarChart3, label: "You", alt: "Insights" },
  { to: "/profile", icon: User, label: "Me", alt: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-3 left-0 w-full flex justify-center z-50 pointer-events-none"
      aria-label="Primary"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 bg-amber-100/95 dark:bg-[--huddle-card]/95 backdrop-blur-md rounded-full ring-1 ring-black/5 dark:ring-white/10"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.alt}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-full transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-amber-300 dark:bg-[--huddle-gold] text-gray-900 shadow-[inset_0_2px_6px_rgba(255,176,0,0.2)]"
                  : "text-gray-900/70 dark:text-[--huddle-text-sub] hover:bg-amber-200/70 dark:hover:bg-white/5"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.4 : 2}
                aria-hidden="true"
              />
              <span
                className="text-[0.6rem] font-semibold leading-none"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
