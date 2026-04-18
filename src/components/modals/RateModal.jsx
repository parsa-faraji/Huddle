import React from "react";

export default function RateModal({ studySpot, isOpen, onClose }) {
  if (!isOpen || !studySpot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-3xl shadow-lg p-6 max-w-md w-80 flex flex-col gap-4 z-10">
        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
          Thank you for rating {studySpot.name}!
        </h2>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Your feedback is valuable and helps others discover great study spots. Ratings are aggregated to highlight the best spots in the community.
        </p>

        <button
          onClick={onClose}
          className="py-2 rounded-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold cursor-pointer"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}