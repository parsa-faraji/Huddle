import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinModal from "../modals/JoinModal";
import { useApp } from "../../context/AppContext";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-[#2C4A7C] mt-0.5 text-lg">{icon}</span>
    <div>
      <p className="font-semibold text-[#1a1a2e] text-xs" style={{ fontFamily: "'Jost', sans-serif" }}>{label}</p>
      <p className="text-gray-600 text-xs leading-snug" style={{ fontFamily: "'Jost', sans-serif" }}>{value}</p>
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

// Badge helpers
const noiseBadgeColor = (level) => (level === "Silent" ? "green" : level === "Medium" ? "orange" : level === "Loud" ? "red" : "grey");
const crowdBadgeColor = (level) => (level === "Low" ? "green" : level === "Medium" ? "orange" : "red");
const openBadgeColor = (isOpen) => (isOpen ? "green" : "red");
const ratingBadgeColor = (rating) => (rating >= 4 ? "green" : rating >= 3 ? "orange" : "red");

function displayRating(data) {
  if (data.ratingCount && data.ratingCount > 0) {
    return (data.ratingSum / data.ratingCount).toFixed(1);
  }
  if (data.rating !== undefined) return Number(data.rating).toFixed(1);
  return null;
}

export default function StudySpotCardL({ data, buttonText = "Join", onJoin, onConfirmJoin }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { checkinCounts } = useApp();
  const rating = displayRating(data);
  const hereNow = checkinCounts?.[data.id] ?? 0;

  return (
    <>
      <div className="flex justify-center w-full p-4">
        <div
          className="bg-white rounded-3xl p-5 max-w-md w-full flex flex-col gap-3"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >

          {/* IMAGE */}
          <img
            src={data?.image ?? "/cat.webp"}
            alt={data?.name ?? "image"}
            loading="lazy"
            className="w-full h-52 object-cover rounded-2xl"
          />

          {/* NAME + DISTANCE */}
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="h-section truncate" style={{ fontSize: "1.25rem" }}>
              {data.name}
            </h1>
            {data.distance !== undefined && (
              <span className="caption-text shrink-0">{data.distance} mi</span>
            )}
          </div>

          {/* TAG BADGES */}
          <div className="flex flex-wrap gap-2 mt-2">
            {data.noiseLevel && (
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Noise</span>
                <Badge label={data.noiseLevel} color={noiseBadgeColor(data.noiseLevel)} />
              </div>
            )}
            {data.crowded && (
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Crowd</span>
                <Badge label={data.crowded} color={crowdBadgeColor(data.crowded)} />
              </div>
            )}
            {data.open !== undefined && (
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Status</span>
                <Badge label={data.open ? "Open" : "Closed"} color={openBadgeColor(data.open)} />
              </div>
            )}
            {rating !== null && (
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Rating</span>
                <Badge label={rating} color={ratingBadgeColor(Number(rating))} />
              </div>
            )}
            {hereNow > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[0.65rem]" style={{ fontFamily: "'Jost', sans-serif" }}>Here now</span>
                <Badge label={`${hereNow} live`} color="green" />
              </div>
            )}
          </div>

          {/* DETAILED INFO ROWS */}
          <div className="flex flex-col gap-2 mt-3">
            {data.roomType && <InfoRow icon="🏠" label="Room Type" value={data.roomType} />}
            {data.location && <InfoRow icon="📍" label="Location" value={data.location} />}
            {data.hours && <InfoRow icon="⏰" label="Hours" value={data.hours} />}
            {data.description && <InfoRow icon="📋" label="Description" value={data.description} />}
            {data.outlets !== undefined && <InfoRow icon="🔌" label="Outlets" value={data.outlets ? "Yes" : "No"} />}
            {data.lighting && <InfoRow icon="💡" label="Lighting" value={data.lighting} />}
          </div>

          {/* JOIN + RATE BUTTONS */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => (onJoin ? onJoin() : setModalOpen(true))}
              className="flex-1 bg-sky-950 hover:bg-sky-900 active:bg-sky-800 transition-colors text-white font-bold text-sm rounded-2xl cursor-pointer py-2.5"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {buttonText}
            </button>
            <button
              onClick={() =>
                navigate("/study-spots/log/" + encodeURIComponent(data.id || data.name), {
                  state: { spotData: data },
                })
              }
              className="flex-1 bg-amber-300 hover:bg-amber-400 active:bg-amber-500 transition-colors text-gray-900 font-bold text-sm rounded-2xl cursor-pointer py-2.5"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Rate
            </button>
          </div>
        </div>
      </div>

      {/* JOIN MODAL */}
      <JoinModal
        group={data}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (onConfirmJoin) onConfirmJoin(data);
          setModalOpen(false);
        }}
      />
    </>
  );
}