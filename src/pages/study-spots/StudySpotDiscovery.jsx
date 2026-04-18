import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudySpotCard from "../../components/cards/StudySpotCard";
import { studySpots } from "../../data/studySpots";

export default function StudySpotDiscovery() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const filteredSpots = studySpots.filter((spot) =>
    spot.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div
        className="w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   shadow-2xl flex flex-col items-center pt-20 px-6 overflow-y-auto"
      >
        {/* TITLE */}
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        <h2
          className="text-center text-black font-medium text-lg mt-10"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Find a study spot!
        </h2>

        {/* 🔍 SEARCH BAR */}
        <div className="w-full mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* RESULTS COUNT */}
        <p
          className="text-sm text-black mt-4 mb-2 w-full text-center"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
        </p>

        {/* CARDS */}
        <div className="w-full flex flex-col gap-4 mb-6 pb-24">
          {filteredSpots.length === 0 ? (
            <p
              className="text-black text-center py-12"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              No spots match your search.
            </p>
          ) : (
            filteredSpots.map((spot) => (
              <StudySpotCard
                key={spot.id}
                spot={spot}
                onViewClick={() => navigate(`/study-spots/${spot.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}