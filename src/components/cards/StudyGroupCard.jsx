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
  level === "Quiet" ? "green" : level === "Medium" ? "orange" : level === "Loud" ? "red" : "grey";
const paceBadgeColor = (type) =>
  type === "Slow" ? "green" : type === "Medium" ? "orange" : type === "Fast" ? "red" : "grey";
const groupBadgeColor = (type) =>
  type === "In-Person" ? "green" : type === "Hybrid" ? "orange" : type === "Virtual" ? "red" : "grey";
const crowdBadgeColor = (numPeople) => {
  if (numPeople <= 3) return "green";       // small group
  if (numPeople <= 5) return "orange";     // medium group
  return "red";                             // large group
};

export default function Card({ data, buttonText = "View" }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white rounded-3xl shadow-md p-4 w-full max-w-xs flex flex-col gap-3">

        {/* HEADER */}
        {(data.name || data.course) && (
          <div className="bg-blue-100 rounded-2xl px-3 py-2">
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
              {data.name ?? data.course}
            </h1>
          </div>
        )}

        {/* INFO LINE */}
        {(data.creator || data.name) && (
          <>
            {data.course && <p className="text-gray-700 font-medium text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>Course: {data.course}</p>}
            {data.creator && <p className="text-gray-700 font-medium text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>Created By: {data.creator}</p>}
          </>
        )}

        {/* BADGES */}
        <div className="flex flex-wrap gap-2">
          {data.noiseLevel && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Noise Level</span>
              <Badge label={data.noiseLevel} color={noiseBadgeColor(data.noiseLevel)} />
            </div>
          )}
          {data.pace && (
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Pace</span>
              <Badge label={data.pace} color={paceBadgeColor(data.pace)} />
            </div>
          )}
          {data?.groupSize && <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Size</span>
              <Badge label={data.groupSize} color={crowdBadgeColor(data.groupSize)} /></div>}
        </div>

        {/* IMAGE + INFO ROWS */}
        <div className="flex gap-3">
          <img
            src={data.image ?? "/cat.webp"}
            alt={data.name ?? "image"}
            className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
          />
          <div className="flex flex-col gap-2 justify-center text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>
            {data.availability && <InfoRow icon="⏰" label="Availability" value={data.availability} />}
            {data.description && <InfoRow icon="📋" label="Description" value={data.description} />}
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => data.id && navigate(`/study-groups/${data.id}`)}
          className="bg-amber-300 hover:bg-amber-400 cursor-pointer transition-colors text-gray-800 font-bold text-sm rounded-2xl py-2 w-full"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {buttonText}
        </button>

      </div>
    </div>
  );
}