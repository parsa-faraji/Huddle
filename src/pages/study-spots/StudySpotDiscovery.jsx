import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, HelpCircle, Search } from "lucide-react";
import StudySpotCard from "../../components/cards/StudySpotCard";
import { EmptyState, SkeletonStack } from "../../components/Skeletons";
import HowItWorks from "../../components/HowItWorks";
import { useApp } from "../../context/AppContext";
import { useFavorites } from "../../hooks/useFavorites";
import {
  hasAnyPreferences,
  topRecommendations,
} from "../../utils/recommendations";

const MapView = lazy(() => import("../../components/MapView"));

const ONBOARDING_KEY = "huddle:onboarded:v2";

const FILTERS = [
  { key: "quiet", label: "Quiet", match: (s) => s.noiseLevel === "Silent" },
  { key: "outlets", label: "Outlets", match: (s) => s.outlets === true },
  { key: "open", label: "Open now", match: (s) => s.open === true },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "name", label: "Name A–Z" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
];

function avgRating(s) {
  if (s.ratingCount && s.ratingCount > 0) return s.ratingSum / s.ratingCount;
  if (typeof s.rating === "number") return s.rating;
  return 0;
}

export default function StudySpotDiscovery() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState({});
  const [view, setView] = useState("list");
  const [sort, setSort] = useState("recommended");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navigate = useNavigate();
  const { spots, userDoc, spotsLoaded } = useApp();
  const { ids: favoriteIds, isFavorite, toggle: toggleFavorite } = useFavorites();

  useEffect(() => {
    try {
      setShowOnboarding(localStorage.getItem(ONBOARDING_KEY) !== "1");
    } catch {
      setShowOnboarding(false);
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const toggleChip = (key) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const q = search.trim().toLowerCase();
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (q) {
        const hay = [spot.name, spot.location, spot.type, spot.roomType]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
          .join(" ");
        if (!hay.includes(q)) return false;
      }
      return FILTERS.every((f) => !active[f.key] || f.match(spot));
    });
  }, [spots, q, active]);

  const recommended = useMemo(
    () => topRecommendations(spots, userDoc?.preferences, 3),
    [spots, userDoc?.preferences],
  );
  const recommendedIds = new Set(recommended.map((s) => s.id));
  const prefsSet = hasAnyPreferences(userDoc?.preferences);

  const sortedOthers = useMemo(() => {
    const base =
      sort === "recommended"
        ? filteredSpots.filter((s) => !recommendedIds.has(s.id))
        : [...filteredSpots];
    if (sort === "name") {
      base.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rating") {
      base.sort((a, b) => avgRating(b) - avgRating(a));
    } else if (sort === "reviews") {
      base.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
    }
    return base;
  }, [filteredSpots, sort, recommendedIds]);

  const favoriteSpots = useMemo(
    () => spots.filter((s) => favoriteIds.includes(s.id)),
    [spots, favoriteIds],
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[--huddle-bg]">
      <div
        className="w-full max-w-96 h-screen relative huddle-frame shadow-2xl
                   flex flex-col items-center pt-20 px-6 overflow-y-auto"
      >
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <button
          type="button"
          onClick={() => setShowOnboarding(true)}
          aria-label="How Huddle works"
          title="How Huddle works"
          className="absolute right-5 top-6 w-9 h-9 rounded-full bg-white/80 dark:bg-[--huddle-card-soft] text-sky-950 dark:text-[--huddle-gold] flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-[--huddle-card] transition active:scale-95"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <HelpCircle size={18} />
        </button>

        <h2
          className="text-center text-black dark:text-[--huddle-text] font-medium text-lg mt-10"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Find a study spot!
        </h2>

        <div
          className="mt-3 inline-flex bg-white/70 dark:bg-[--huddle-card-soft] rounded-full p-1 shadow-sm"
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
                  on
                    ? "bg-sky-950 text-white dark:bg-[--huddle-gold] dark:text-slate-900"
                    : "text-black dark:text-[--huddle-text]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="w-full mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[--huddle-text-sub]"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search study spots"
              placeholder="Search study spots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[--huddle-card] border border-gray-200 dark:border-[--huddle-border] rounded-2xl pl-8 pr-3 py-2 text-sm text-[--huddle-text] placeholder-[#9C8A73] dark:placeholder-[--huddle-text-sub] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              style={{ fontFamily: "'Jost', sans-serif" }}
            />
          </div>
          <label htmlFor="sort-select" className="sr-only">
            Sort
          </label>
          <div className="relative">
            <ArrowUpDown
              size={14}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[--huddle-text-sub] pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="sort-select"
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white dark:bg-[--huddle-card] border border-gray-200 dark:border-[--huddle-border] rounded-2xl pl-7 pr-3 py-2 text-xs font-semibold text-[--huddle-text] shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                onClick={() => toggleChip(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer active:scale-95 ${
                  on
                    ? "bg-amber-300 text-black border-amber-400"
                    : "bg-white dark:bg-[--huddle-card] text-black dark:text-[--huddle-text] border-gray-200 dark:border-[--huddle-border]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {view === "map" && (
          <div className="w-full mt-6 pb-24">
            <Suspense
              fallback={
                <div className="w-full h-[60vh] rounded-2xl bg-white/60 dark:bg-[--huddle-card-soft] flex items-center justify-center">
                  <p
                    className="text-sm text-[#5C4033] dark:text-[--huddle-text-sub]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Loading map…
                  </p>
                </div>
              }
            >
              <MapView spots={filteredSpots} />
            </Suspense>
          </div>
        )}

        <HowItWorks open={showOnboarding} onClose={dismissOnboarding} />

        {view === "list" && !prefsSet && (
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full mt-4 bg-white/70 dark:bg-[--huddle-card-soft] rounded-xl px-4 py-2 text-xs text-[#5C4033] dark:text-[--huddle-text-sub] cursor-pointer hover:bg-white dark:hover:bg-[--huddle-card] text-left transition"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Set your study preferences on Profile to see personalized recommendations.
          </button>
        )}

        {view === "list" && favoriteSpots.length > 0 && (
          <div className="w-full mt-6" data-testid="favorites-strip">
            <p
              className="text-sm text-black dark:text-[--huddle-text] font-semibold mb-2"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Your favorites
            </p>
            <div className="w-full flex flex-col gap-4">
              {favoriteSpots.slice(0, 3).map((spot) => (
                <StudySpotCard
                  key={`fav-${spot.id}`}
                  spot={spot}
                  isFavorite={isFavorite(spot.id)}
                  onToggleFavorite={() => toggleFavorite(spot.id)}
                />
              ))}
            </div>
          </div>
        )}

        {view === "list" && sort === "recommended" && recommended.length > 0 && (
          <div className="w-full mt-6">
            <p
              className="text-sm text-black dark:text-[--huddle-text] font-semibold mb-2"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Recommended for you
            </p>
            <div className="w-full flex flex-col gap-4">
              {recommended.map((spot) => (
                <StudySpotCard
                  key={`rec-${spot.id}`}
                  spot={spot}
                  isFavorite={isFavorite(spot.id)}
                  onToggleFavorite={() => toggleFavorite(spot.id)}
                />
              ))}
            </div>
          </div>
        )}

        {view === "list" && (
          <div className="w-full flex flex-col gap-4 mb-6 pb-24 mt-6">
            {sort === "recommended" &&
              recommended.length > 0 &&
              sortedOthers.length > 0 && (
                <p
                  className="text-sm text-black dark:text-[--huddle-text] font-semibold"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  All spots
                </p>
              )}
            {!spotsLoaded ? (
              <SkeletonStack count={3} />
            ) : sortedOthers.length === 0 ? (
              <EmptyState
                icon="🔎"
                title="No spots match"
                body={
                  search
                    ? `Nothing found for "${search}". Try a different search or clear filters.`
                    : "Try clearing filters to see all spots."
                }
              />
            ) : (
              sortedOthers.map((spot) => (
                <StudySpotCard
                  key={spot.id}
                  spot={spot}
                  isFavorite={isFavorite(spot.id)}
                  onToggleFavorite={() => toggleFavorite(spot.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
