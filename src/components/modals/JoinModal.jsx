import React from "react";

export default function JoinModal({ group, isOpen, onClose }) {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-3xl shadow-lg p-6 max-w-md w-80 flex flex-col gap-4 z-10">
        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
          You're in {group.name ?? group.course}!
        </h2>

        {(group.meetingTime || group.hours) && (
          <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
            <strong>{group.meetingTime ? "Next Meeting:" : "Hours:"}</strong>{" "}
            {group.meetingTime
              ? `${group.meetingTime}${group.meetingPlace ? ` at ${group.meetingPlace}` : ""}`
              : group.hours}
          </p>
        )}

        {group.members && group.members.length > 0 && (
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
              Members:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600" style={{ fontFamily: "'Jost', sans-serif" }}>
              {group.members.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <button className="py-2 rounded-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold cursor-pointer" style={{ fontFamily: "'Jost', sans-serif" }}>
            Message Group
          </button>
          <button className="py-2 rounded-full bg-green-200 hover:bg-green-300 text-gray-800 font-semibold cursor-pointer" style={{ fontFamily: "'Jost', sans-serif" }}>
            Add to Calendar
          </button>
          <button className="py-2 rounded-full bg-red-200 hover:bg-red-300 text-gray-800 font-semibold cursor-pointer" style={{ fontFamily: "'Jost', sans-serif" }}>
            Leave Group
          </button>
          <button
            onClick={onClose}
            className="py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold cursor-pointer"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}