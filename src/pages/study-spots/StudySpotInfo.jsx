import { useState } from "react";
import { useParams } from "react-router-dom";
import StudySpotCardL from "../../components/cards/StudySpotCardL";
import JoinModal from "../../components/modals/JoinModal";
import { useApp } from "../../context/AppContext";

export default function StudySpotInfo() {
  const { id } = useParams();
  const { spots, userDoc, joinSpot, leaveSpot } = useApp();
  const spot = spots.find((s) => s.id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (spots.length === 0) return <p className="text-center mt-20">Loading…</p>;
  if (!spot) return <p className="text-center mt-20">Study Spot not found.</p>;

  const isJoined = (userDoc?.joinedSpotIds ?? []).includes(spot.id);

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

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div
          className="w-96 h-screen relative
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