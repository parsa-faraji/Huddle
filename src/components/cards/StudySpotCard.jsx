import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { useApp } from "../../context/AppContext";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-[#2C4A7C] dark:text-[--huddle-gold] mt-0.5 text-lg">
      {icon}
    </span>
    <div>
      <p
        className="font-semibold text-[#1a1a2e] dark:text-[--huddle-text] text-xs"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {label}
      </p>
      <p
        className="text-gray-600 dark:text-[--huddle-text-sub] text-xs leading-snug"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {value}
      </p>
    </div>
  </div>
);

const Badge = ({ label, color }) => {
  const colors = {
    green:
      "bg-green-200 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    orange:
      "bg-orange-200 text-orange-800 dark:bg-amber-500/20 dark:text-amber-300",
    red: "bg-red-300 text-red-800 dark:bg-rose-500/20 dark:text-rose-300",
    grey: "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-slate-200",
  };
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-semibold text-center ${colors[color]}`}
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {label}
    </div>
  );
};

const noiseBadgeColor = (level) =>
  level === "Silent"
    ? "green"
    : level === "Medium"
      ? "orange"
      : level === "Loud"
        ? "red"
        : "grey";
const crowdBadgeColor = (level) =>
  level === "Low" || level === "Small"
    ? "green"
    : level === "Medium"
      ? "orange"
      : "red";
const ratingBadgeColor = (rating) =>
  rating >= 4 ? "green" : rating >= 3.0 ? "orange" : "red";

function displayRating(spot) {
  if (spot.ratingCount && spot.ratingCount > 0) {
    return (spot.ratingSum / spot.ratingCount).toFixed(1);
  }
  if (spot.rating !== undefined) return Number(spot.rating).toFixed(1);
  return null;
}

export default function StudySpotCard({
  spot,
  isFavorite = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const { checkinCounts } = useApp();
  const rating = displayRating(spot);
  const hereNow = checkinCounts?.[spot.id] ?? 0;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(spot.id);
  };

  return (
    <div className="flex justify-center w-full">
      <div
        className="relative bg-white dark:bg-[--huddle-card] rounded-3xl p-5 w-full max-w-sm flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
        style={{ boxShadow: "var(--shadow-md)" }}
        data-testid="spot-card"
      >
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={
              isFavorite ? `Unfavorite ${spot.name}` : `Favorite ${spot.name}`
            }
            aria-pressed={isFavorite}
            onClick={handleFavoriteClick}
            data-testid="favorite-toggle"
            className={clsx(
              "absolute top-3 right-3 z-10 inline-flex items-center justify-center rounded-full p-2 w-9 h-9 backdrop-blur transition active:scale-90",
              "bg-white/80 hover:bg-white dark:bg-[--huddle-card-soft] dark:hover:bg-[--huddle-card]",
              "ring-1 ring-black/5 dark:ring-white/10",
              isFavorite
                ? "text-rose-500"
                : "text-slate-400 dark:text-slate-500 hover:text-rose-500",
            )}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        <div className="flex items-baseline justify-between gap-2 pr-10">
          <h1 className="h-card truncate dark:text-[--huddle-text]" data-testid="spot-name">
            {spot.name}
          </h1>
          {spot.distance !== undefined && (
            <span className="caption-text dark:text-[--huddle-text-sub] shrink-0">
              {spot.distance} mi
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {spot.noiseLevel && (
            <div className="flex flex-col items-center">
              <span
                className="text-gray-500 dark:text-[--huddle-text-sub] text-[0.65rem]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Noise
              </span>
              <Badge
                label={spot.noiseLevel}
                color={noiseBadgeColor(spot.noiseLevel)}
              />
            </div>
          )}
          {spot.crowded && (
            <div className="flex flex-col items-center">
              <span
                className="text-gray-500 dark:text-[--huddle-text-sub] text-[0.65rem]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Crowded
              </span>
              <Badge
                label={spot.crowded}
                color={crowdBadgeColor(spot.crowded)}
              />
            </div>
          )}
          {spot.open !== undefined && (
            <div className="flex flex-col items-center">
              <span
                className="text-gray-500 dark:text-[--huddle-text-sub] text-[0.65rem]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Status
              </span>
              <Badge
                label={spot.open ? "Open" : "Closed"}
                color={spot.open ? "green" : "red"}
              />
            </div>
          )}
          {rating !== null && (
            <div className="flex flex-col items-center">
              <span
                className="text-gray-500 dark:text-[--huddle-text-sub] text-[0.65rem]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Rating
              </span>
              <Badge
                label={rating}
                color={ratingBadgeColor(Number(rating))}
              />
            </div>
          )}
          {hereNow > 0 && (
            <div className="flex flex-col items-center">
              <span
                className="text-gray-500 dark:text-[--huddle-text-sub] text-[0.65rem]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Here now
              </span>
              <Badge label={`${hereNow} live`} color="green" />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <img
            src={spot.image ?? "/cat.webp"}
            alt={spot.name}
            loading="lazy"
            className="w-24 h-24 object-cover rounded-2xl flex-shrink-0 bg-gray-100 dark:bg-white/5"
          />
          <div
            className="flex flex-col gap-2 justify-center text-xs"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {spot.roomType && (
              <InfoRow icon="🏠" label="Room Type" value={spot.roomType} />
            )}
            {spot.hours && (
              <InfoRow icon="⏰" label="Hours" value={spot.hours} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0">
          <div
            className="flex items-center gap-2 flex-wrap text-[0.7rem]"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            <span className="font-medium text-gray-700 dark:text-[--huddle-text-sub]">
              Navigate
            </span>
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-300 dark:border-[--huddle-border] px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition whitespace-nowrap text-[--huddle-text]"
            >
              Apple
            </a>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-300 dark:border-[--huddle-border] px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition whitespace-nowrap text-[--huddle-text]"
            >
              Google
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/study-spots/${spot.id}`)}
          className="bg-amber-300 hover:bg-amber-400 active:bg-amber-500 dark:bg-[--huddle-gold] dark:hover:brightness-110 cursor-pointer transition-colors text-gray-900 font-semibold text-sm rounded-2xl py-2.5 w-full mt-1 active:scale-[0.98]"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          View
        </button>
      </div>
    </div>
  );
}
