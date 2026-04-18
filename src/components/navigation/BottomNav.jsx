import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: "/study-spots", icon: "/map.svg" },
    { to: "/study-groups", icon: "/person.svg" },
    { to: "/insights", icon: "/insights.png" },
  ];

  return (
    <nav className="fixed bottom-4 left-0 w-full flex justify-center z-50">
      {/* Rounded yellow pill background */}
      <div
        className="w-70 h-18 flex justify-around items-center shadow-lg px-4"
        style={{ backgroundColor: "#FFE3A5E0", borderRadius: "50px" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <div
              key={item.to}
              className="relative flex flex-col items-center justify-center w-16 h-16 cursor-pointer"
              onClick={() => navigate(item.to)}
            >
              {/* Active circle */}
              {isActive && (
                <div
                  className="absolute w-16 h-16 top-0 left-0 rounded-full z-0"
                  style={{ backgroundColor: "#FFD475" }}
                />
              )}

              {/* Icon */}
              <img
                src={item.icon}
                className={`w-10 h-10 z-10 ${isActive ? "brightness-110" : "brightness-90"}`}
              />

            </div>
          );
        })}
      </div>
    </nav>
  );
}