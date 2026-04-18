import React from "react";

export default function CreateModal({ group, isOpen, onClose }) {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-3xl shadow-lg p-6 max-w-md w-80 flex flex-col gap-4 z-10">
        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Jost', sans-serif" }}>
          {group.name} has been created!
        </h2>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Your study group for <strong>{group.course}</strong> has been successfully created.
        </p>

        <p className="text-sm text-gray-700" style={{ fontFamily: "'Jost', sans-serif" }}>
          Meeting Time: {group.meetingTime || "TBD"} <br />
          Location: {group.location || "TBD"}
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