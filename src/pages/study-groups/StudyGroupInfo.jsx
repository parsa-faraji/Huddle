import { useState } from "react";
import { useParams } from "react-router-dom";
import StudyGroupCardL from "../../components/cards/StudyGroupCardL";
import JoinModal from "../../components/modals/JoinModal";
import { useApp } from "../../context/AppContext";

export default function StudyGroupInfo() {
  const { id } = useParams();
  const { groups, joinGroup } = useApp();
  const group = groups.find((g) => g.id === parseInt(id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!group) return <div>Group not found</div>;

  const handleConfirmJoin = () => {
    joinGroup(group);
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
            <StudyGroupCardL
              data={group}
              buttonText="Join"
              onJoin={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <JoinModal
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmJoin}
      />
    </>
  );
}