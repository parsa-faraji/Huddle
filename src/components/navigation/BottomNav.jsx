import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: "/study-spots", icon: "/map.svg", label: "Spots", alt: "Study spots" },
    { to: "/study-groups", icon: "/person.svg", label: "Groups", alt: "Study groups" },
    { to: "/insights", icon: "/insights.png", label: "You", alt: "Insights" },
    { to: "/profile", label: "Me", alt: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-3 left-0 w-full flex justify-center z-50 pointer-events-none"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 bg-amber-100/95 backdrop-blur-md rounded-full"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const isMeItem = item.to === "/profile";

          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.alt}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-full transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-300 shadow-[inset_0_2px_6px_rgba(255,176,0,0.2)]"
                  : "hover:bg-amber-200/70"
              }`}
            >
              {item.icon ? (
                <img
                  src={item.icon}
                  alt=""
                  className={`w-6 h-6 transition-opacity ${
                    isActive ? "opacity-100" : "opacity-70"
                  }`}
                />
              ) : (
                <span
                  className={`text-base font-bold transition-opacity ${
                    isActive ? "text-gray-900" : "text-gray-900/70"
                  }`}
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {isMeItem ? "Me" : item.label}
                </span>
              )}
              {item.icon && (
                <span
                  className={`text-[0.6rem] font-semibold leading-none transition-opacity ${
                    isActive ? "text-gray-900 opacity-100" : "text-gray-900/70"
                  }`}
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}