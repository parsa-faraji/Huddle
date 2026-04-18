import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getUserEmails } from "../../services/users";
import { downloadICS } from "../../services/calendar";

export default function JoinModal({ group, isOpen, onClose }) {
  const { leaveGroup, leaveSpot } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !group) return null;

  // Heuristic: a group has memberIds or meetingTime; a spot does not.
  const isGroup = Array.isArray(group.memberIds) || !!group.meetingTime;
  const canCalendar = !!group.meetingTime;

  const handleMessage = async () => {
    setError("");
    try {
      const ids = group.memberIds || [];
      const emails = await getUserEmails(ids);
      if (emails.length === 0) {
        setError("No member emails available yet.");
        return;
      }
      const subject = encodeURIComponent(`Huddle: ${group.name || group.course || "Study Group"}`);
      window.location.href = `mailto:${emails.join(",")}?subject=${subject}`;
    } catch (e) {
      setError(e?.message || "Couldn't open mail.");
    }
  };

  const handleCalendar = () => {
    setError("");
    try {
      downloadICS(group);
    } catch (e) {
      setError(e?.message || "Couldn't generate calendar event.");
    }
  };

  const handleLeave = async () => {
    setError("");
    setBusy(true);
    try {
      if (isGroup) await leaveGroup(group);
      else await leaveSpot(group);
      onClose();
    } catch (e) {
      setError(e?.message || "Couldn't leave.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

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

        {error && (
          <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {isGroup && (
            <button
              onClick={handleMessage}
              className="py-2 rounded-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-semibold cursor-pointer"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Message Group
            </button>
          )}
          {canCalendar && (
            <button
              onClick={handleCalendar}
              className="py-2 rounded-full bg-green-200 hover:bg-green-300 text-gray-800 font-semibold cursor-pointer"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Add to Calendar
            </button>
          )}
          <button
            onClick={handleLeave}
            disabled={busy}
            className="py-2 rounded-full bg-red-200 hover:bg-red-300 text-gray-800 font-semibold cursor-pointer disabled:opacity-60"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {busy ? "Leaving..." : isGroup ? "Leave Group" : "Leave Spot"}
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
