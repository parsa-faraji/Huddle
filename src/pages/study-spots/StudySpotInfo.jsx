import { useState } from "react";
import { useParams } from "react-router-dom";
import StudySpotCardL from "../../components/cards/StudySpotCardL";
import JoinModal from "../../components/modals/JoinModal";
import { useApp } from "../../context/AppContext";

export default function StudySpotInfo() {
  const { id } = useParams();
  const {
    spots,
    userDoc,
    joinSpot,
    leaveSpot,
    checkinCounts,
    myCheckin,
    checkInAtSpot,
    cancelMyCheckin,
  } = useApp();
  const spot = spots.find((s) => s.id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [checkinError, setCheckinError] = useState("");

  if (spots.length === 0) return <p className="text-center mt-20">Loading…</p>;
  if (!spot) return <p className="text-center mt-20">Study Spot not found.</p>;

  const isJoined = (userDoc?.joinedSpotIds ?? []).includes(spot.id);
  const activeCount = checkinCounts?.[spot.id] ?? 0;
  const hereNow = !!myCheckin && myCheckin.spotId === spot.id;
  const checkedInElsewhere = !!myCheckin && myCheckin.spotId !== spot.id;
  const elsewhereName = checkedInElsewhere
    ? spots.find((s) => s.id === myCheckin.spotId)?.name
    : null;

  const handleJoin = async () => {
    setBusy(true);
    try {
      await joinSpot(spot);
      setIsModalOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leaveSpot(spot);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckin = async () => {
    setCheckinBusy(true);
    setCheckinError("");
    try {
      if (hereNow) {
        await cancelMyCheckin();
      } else {
        if (checkedInElsewhere) await cancelMyCheckin();
        await checkInAtSpot(spot.id);
      }
    } catch (e) {
      setCheckinError(e?.message || "Check-in failed.");
    } finally {
      setCheckinBusy(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div
          className="w-full max-w-96 h-screen relative
                     bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                     shadow-2xl overflow-y-auto flex flex-col items-center"
        >
          {/* Huddle header */}
          <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">
            Huddle
          </h1>

          {/* Scrollable content */}
          <div className="mt-28 flex flex-col items-center w-88 gap-4 pb-24">
            <StudySpotCardL
              data={spot}
              buttonText={busy ? "…" : isJoined ? "Leave" : "Join"}
              onJoin={isJoined ? handleLeave : handleJoin}
            />

            {/* CHECK-IN CARD */}
            <div
              className="bg-white rounded-3xl shadow-md p-4 max-w-md w-full flex flex-col gap-3 mx-4"
              style={{ fontFamily: "'Jost', sans-serif" }}
              data-testid="checkin-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Live crowd</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activeCount > 0 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
                  }`}
                  data-testid="checkin-count"
                >
                  {activeCount} here now
                </span>
              </div>
              {checkedInElsewhere && !hereNow && (
                <p className="text-xs text-amber-700">
                  You&rsquo;re currently checked in at {elsewhereName ?? "another spot"}. Checking
                  in here will move you.
                </p>
              )}
              {checkinError && (
                <p className="text-xs text-red-700" role="alert">
                  {checkinError}
                </p>
              )}
              <button
                type="button"
                onClick={handleCheckin}
                disabled={checkinBusy}
                data-testid="checkin-button"
                aria-pressed={hereNow}
                className={`h-11 rounded-2xl text-sm font-bold cursor-pointer transition disabled:opacity-60 ${
                  hereNow
                    ? "bg-amber-100 text-black hover:bg-amber-200"
                    : "bg-sky-950 text-white hover:bg-sky-900"
                }`}
              >
                {checkinBusy
                  ? "…"
                  : hereNow
                  ? "Check out"
                  : "I'm here now"}
              </button>
              <p className="text-[0.65rem] text-gray-500">
                Check-ins last 15 min. Others see the count live.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <JoinModal
          group={spot}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}