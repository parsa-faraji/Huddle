import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/study-groups/${group.id}`)}
      className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col gap-2"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <p className="font-bold text-black text-base">
        {group.name ?? group.course}
      </p>
      {group.course && (
        <p className="text-xs text-[#5C4033]">Course: {group.course}</p>
      )}
      {group.meetingTime && (
        <p className="text-xs text-[#5C4033]">
          Next Meeting: {group.meetingTime}
        </p>
      )}
    </div>
  );
}

function SpotCard({ session }) {
  const navigate = useNavigate();
  const targetId = session.spotId ?? session.id;

  return (
    <div
      onClick={() => targetId && navigate(`/study-spots/${targetId}`)}
      className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col gap-2"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <p className="font-bold text-black text-base">{session.spot}</p>
      <div className="flex flex-wrap text-xs gap-3 text-[#5C4033] mt-1">
        {session.productivity ? <span>Productivity: {session.productivity}</span> : null}
        {session.comfort ? <span>Comfort: {session.comfort}</span> : null}
        {session.location ? <span>Location: {session.location}</span> : null}
        {session.recommend !== undefined && session.recommend !== null && (
          <span>Recommend: {session.recommend ? "Yes" : "No"}</span>
        )}
      </div>
    </div>
  );
}

function JoinedSpotCard({ spot }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/study-spots/${spot.id}`)}
      className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col gap-1"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <p className="font-bold text-black text-base">{spot.name}</p>
      {spot.hours && <p className="text-xs text-[#5C4033]">Hours: {spot.hours}</p>}
      {spot.location && <p className="text-xs text-[#5C4033]">{spot.location}</p>}
    </div>
  );
}

export default function InsightsPage() {
  const { joinedGroups, joinedSpots, sessions } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div
        className="w-full max-w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   shadow-2xl flex flex-col items-center pt-20 px-6 overflow-y-auto"
      >
        {/* TITLE */}
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        {/* Study Groups Section */}
        <div className="w-full mt-10">
          <h2
            className="text-center text-black font-medium text-lg mb-4"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Study Groups Joined
          </h2>

          <div className="flex flex-col gap-4">
            {joinedGroups.length === 0 ? (
              <p className="text-[#5C4033] text-xs text-center">
                You haven't joined any groups yet.
              </p>
            ) : (
              joinedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            )}
          </div>
        </div>

        {/* Joined Spots Section */}
        <div className="w-full mt-10">
          <h2
            className="text-center text-black font-medium text-lg mb-4"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Study Spots Joined
          </h2>

          <div className="flex flex-col gap-4">
            {joinedSpots.length === 0 ? (
              <p className="text-[#5C4033] text-xs text-center">
                You haven't joined any spots yet.
              </p>
            ) : (
              joinedSpots.map((spot) => (
                <JoinedSpotCard key={spot.id} spot={spot} />
              ))
            )}
          </div>
        </div>

        {/* Study Spots Section */}
        <div className="w-full mt-10 mb-6">
          <h2
            className="text-center text-black font-medium text-lg mb-4"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Study Spots Rated
          </h2>

          <div className="flex flex-col gap-4">
            {sessions.length === 0 ? (
              <p className="text-[#5C4033] text-xs text-center">
                You haven't rated any spots yet.
              </p>
            ) : (
              sessions.map((session) => (
                <SpotCard key={session.id} session={session} />
              ))
            )}
          </div>
        </div>

        {/* Account / Sign Out */}
        <div className="w-full mt-10 mb-24 flex flex-col items-center gap-2">
          {user?.email && (
            <p className="text-xs text-[#5C4033]" style={{ fontFamily: "'Jost', sans-serif" }}>
              Signed in as {user.email}
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="px-6 py-2 rounded-full bg-sky-950 text-white font-bold text-sm cursor-pointer hover:bg-sky-900"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}