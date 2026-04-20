import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudyGroupCardL from "../../components/cards/StudyGroupCardL";
import JoinModal from "../../components/modals/JoinModal";
import GroupChat from "../../components/GroupChat";
import { useApp } from "../../context/AppContext";
import { getUserDocs } from "../../services/users";
import { aggregatePreferences, topRecommendations } from "../../utils/recommendations";

export default function StudyGroupInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, spots, userDoc, joinGroup, leaveGroup } = useApp();
  const group = groups.find((g) => g.id === id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [groupRecs, setGroupRecs] = useState([]);

  useEffect(() => {
    const memberIds = group?.memberIds ?? [];
    if (memberIds.length === 0 || spots.length === 0) {
      setGroupRecs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const docs = await getUserDocs(memberIds);
        if (cancelled) return;
        const agg = aggregatePreferences(docs.map((d) => d.preferences));
        setGroupRecs(topRecommendations(spots, agg, 3));
      } catch {
        if (!cancelled) setGroupRecs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [group?.id, group?.memberIds, spots]);

  if (groups.length === 0) return <p className="text-center mt-20">Loading…</p>;
  if (!group) return <p className="text-center mt-20">Group not found.</p>;

  const isJoined = (userDoc?.joinedGroupIds ?? []).includes(group.id);

  const handleJoin = async () => {
    setBusy(true);
    try {
      await joinGroup(group);
      setIsModalOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leaveGroup(group);
    } finally {
      setBusy(false);
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
            <StudyGroupCardL
              data={group}
              buttonText={busy ? "…" : isJoined ? "Leave" : "Join"}
              onJoin={isJoined ? handleLeave : handleJoin}
            />

            {groupRecs.length > 0 && (
              <div className="w-full px-4">
                <p
                  className="text-sm text-black font-semibold mb-2"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Recommended spots for this group
                </p>
                <div className="flex flex-col gap-2">
                  {groupRecs.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => navigate(`/study-spots/${spot.id}`)}
                      className="bg-white rounded-2xl p-3 shadow-md text-left cursor-pointer hover:shadow-lg transition"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      <p className="font-bold text-black text-sm">{spot.name}</p>
                      <p className="text-xs text-[#5C4033] mt-0.5">
                        {[spot.noiseLevel, spot.lighting, spot.crowded]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isJoined ? (
              <div className="w-full px-4">
                <GroupChat groupId={group.id} />
              </div>
            ) : (
              <div
                className="w-full px-4"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                <div className="bg-white/60 rounded-2xl p-4 text-center text-xs text-[#5C4033]">
                  Join this group to see messages and coordinate meetings.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <JoinModal
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}