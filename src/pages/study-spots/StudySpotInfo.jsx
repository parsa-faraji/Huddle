import { useState } from "react";
import { useParams } from "react-router-dom";
import { studySpots } from "../../data/studySpots";
import StudySpotCardL from "../../components/cards/StudySpotCardL";
import JoinModal from "../../components/modals/JoinModal";
import { useApp } from "../../context/AppContext";

export default function StudySpotInfo() {
  const { id } = useParams();
  const spot = studySpots.find((s) => s.id === parseInt(id));

  const { joinSpot } = useApp(); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!spot) return <p className="text-center mt-20">Study Spot not found.</p>;

  const handleConfirmJoin = () => {
    if (joinSpot) joinSpot(spot);
    setIsModalOpen(false);
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
              buttonText="Join"
              onJoin={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <JoinModal
          group={spot} 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmJoin}
        />
      )}
    </>
  );
}