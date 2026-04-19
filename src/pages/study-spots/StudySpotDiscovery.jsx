import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudySpotCard from "../../components/cards/StudySpotCard";
import MapView from "../../components/MapView";
import { useApp } from "../../context/AppContext";
import { topRecommendations } from "../../utils/recommendations";

const FILTERS = [
  { key: "quiet", label: "Quiet", match: (s) => s.noiseLevel === "Silent" },
  { key: "outlets", label: "Outlets", match: (s) => s.outlets === true },
  { key: "open", label: "Open now", match: (s) => s.open === true },
];

export default function StudySpotDiscovery() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState({});
  const [view, setView] = useState("list"); // "list" | "map"

  const navigate = useNavigate();
  const { spots, userDoc } = useApp();

  const toggle = (key) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredSpots = spots.filter((spot) => {
    if (!spot.name.toLowerCase().includes(search.toLowerCase())) return false;
    return FILTERS.every((f) => !active[f.key] || f.match(spot));
  });

  const recommended = topRecommendations(spots, userDoc?.preferences, 3);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div
        className="w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   shadow-2xl flex flex-col items-center pt-20 px-6 overflow-y-auto"
      >
        {/* TITLE */}
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        <h2
          className="text-center text-black font-medium text-lg mt-10"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Find a study spot!
        </h2>

        {/* VIEW TOGGLE */}
        <div
          className="mt-3 inline-flex bg-white/70 rounded-full p-1 shadow-sm"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {[
            { key: "list", label: "List" },
            { key: "map", label: "Map" },
          ].map((t) => {
            const on = view === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setView(t.key)}
                aria-pressed={on}
                className={`px-4 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                  on ? "bg-sky-950 text-white" : "text-black"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="w-full mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* FILTER CHIPS */}
        <div
          className="w-full mt-3 flex flex-wrap gap-2 justify-center"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {FILTERS.map((f) => {
            const on = !!active[f.key];
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                  on
                    ? "bg-amber-300 text-black border-amber-400"
                    : "bg-white text-black border-gray-200"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* MAP VIEW */}
        {view === "map" && (
          <div className="w-full mt-6 pb-24">
            <MapView spots={filteredSpots} />
          </div>
        )}

        {/* RECOMMENDED FOR YOU */}
        {view === "list" && recommended.length > 0 && (
          <div className="w-full mt-6">
            <p
              className="text-sm text-black font-semibold mb-2"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Recommended for you
            </p>
            <div className="w-full flex flex-col gap-4">
              {recommended.map((spot) => (
                <StudySpotCard
                  key={`rec-${spot.id}`}
                  spot={spot}
                  onViewClick={() => navigate(`/study-spots/${spot.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* CARDS */}
        {view === "list" && (
        <div className="w-full flex flex-col gap-4 mb-6 pb-24 mt-6">
          {recommended.length > 0 && (
            <p
              className="text-sm text-black font-semibold"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              All spots
            </p>
          )}
          {filteredSpots.length === 0 ? (
            <p
              className="text-black text-center py-12"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              No spots match your search.
            </p>
          ) : (
            filteredSpots.map((spot) => (
              <StudySpotCard
                key={spot.id}
                spot={spot}
                onViewClick={() => navigate(`/study-spots/${spot.id}`)}
              />
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
}