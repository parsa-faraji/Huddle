import { useNavigate } from "react-router-dom";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-[#2C4A7C] mt-0.5 text-lg">{icon}</span>
    <div>
      <p className="font-semibold text-[#1a1a2e] text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
        {label}
      </p>
      <p className="text-gray-600 text-xs leading-snug" style={{ fontFamily: "'Jost', sans-serif" }}>
        {value}
      </p>
    </div>
  </div>
);

const Badge = ({ label, color }) => {
  const colors = {
    green: "bg-green-200 text-green-800",
    orange: "bg-orange-200 text-orange-800",
    red: "bg-red-300 text-red-800",
    grey: "bg-gray-200 text-gray-800",
  };
  return (
    <div className={`rounded-full px-3 py-1 text-xs font-semibold text-center ${colors[color]}`} style={{ fontFamily: "'Jost', sans-serif" }}>
      {label}
    </div>
  );
};

const noiseBadgeColor = (level) =>
  level === "Silent" ? "green" : level === "Medium" ? "orange" : level === "Loud" ? "red" : "grey";
const crowdBadgeColor = (level) =>
  level === "Low" || level === "Small" ? "green" : level === "Medium" ? "orange" : "red";
const ratingBadgeColor = (rating) => (rating >= 4 ? "green" : rating >= 3.0 ? "orange" : "red");

export default function StudySpotCard({ spot }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white rounded-3xl shadow-md p-4 max-w-xs w-full flex flex-col gap-3">

        {/* HEADER */}
        <div className="bg-blue-100 rounded-2xl px-3 py-2">
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
            {spot.name}
          </h1>
        </div>

        {/* DISTANCE */}
        <p className="text-gray-700 font-medium text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
          {spot.distance} miles away
        </p>

        {/* BADGES */}
        <div className="flex flex-wrap gap-2">
          {spot.noiseLevel && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Noise</span>
              <Badge label={spot.noiseLevel} color={noiseBadgeColor(spot.noiseLevel)} />
            </div>
          )}
          {spot.crowded && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Crowded</span>
              <Badge label={spot.crowded} color={crowdBadgeColor(spot.crowded)} />
            </div>
          )}
          {spot.open !== undefined && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Status</span>
              <Badge label={spot.open ? "Open" : "Closed"} color={spot.open ? "green" : "red"} />
            </div>
          )}
          {spot.rating !== undefined && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Rating</span>
              <Badge label={`${spot.rating}`} color={ratingBadgeColor(spot.rating)} />
            </div>
          )}
        </div>

        {/* IMAGE + INFO ROWS */}
        <div className="flex gap-3">
          <img src={spot.image ?? "/cat.webp"} alt={spot.name} className="w-24 h-24 object-cover rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-2 justify-center text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
            {spot.roomType && <InfoRow icon="🏠" label="Room Type" value={spot.roomType} />}
            {spot.hours && <InfoRow icon="⏰" label="Hours" value={spot.hours} />}
          </div>
        </div>

        {/* NAVIGATE LINKS */}
        <div className="flex items-center justify-between gap-2 mt-0">
          <div className="flex items-center gap-2 flex-wrap text-[0.7rem]" style={{ fontFamily: "'Jost', sans-serif" }}>
            <span className="font-medium text-gray-700">Navigate</span>
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 transition whitespace-nowrap"
            >
              Apple
            </a>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 transition whitespace-nowrap"
            >
              Google
            </a>
          </div>
        </div>

        {/* LARGE VIEW BUTTON */}
        <button
          onClick={() => navigate(`/study-spots/${spot.id}`)}
          className="bg-amber-300 hover:bg-amber-400 cursor-pointer transition-colors text-gray-800 font-semibold text-sm rounded-2xl py-2 w-full mt-0"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          View
        </button>

      </div>
    </div>
  );
}