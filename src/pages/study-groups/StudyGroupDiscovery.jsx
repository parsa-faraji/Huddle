import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudyGroupCard from "../../components/cards/StudyGroupCard";
import { EmptyState, SkeletonStack } from "../../components/Skeletons";
import { useApp } from "../../context/AppContext";

export default function StudyGroupDiscovery() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { groups, groupsLoaded } = useApp();

  const filteredGroups = groups.filter((group) =>
    (group.course || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[--huddle-card]">
      <div
        className="w-full max-w-96 h-screen relative
                   huddle-frame
                   shadow-2xl flex flex-col items-center pt-20 px-6 overflow-y-auto pb-16"
      >
        {/* TITLE */}
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        {/* Header */}
        <div className="flex items-center justify-center w-full mt-10">
          <h2
            className="text-center text-black dark:text-[--huddle-text] font-medium text-lg"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Join a study group!
          </h2>
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="w-full mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search study groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs bg-white dark:bg-[--huddle-card] border border-gray-200 dark:border-[--huddle-border] rounded-2xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* CARDS */}
        <div className="w-full flex flex-col gap-4 mt-6">
          {!groupsLoaded ? (
            <SkeletonStack count={3} groupCard />
          ) : filteredGroups.length === 0 ? (
            <EmptyState
              icon={search ? "🔎" : "✨"}
              title={search ? "No matches" : "Be the first"}
              body={
                search
                  ? `Nothing found for "${search}".`
                  : "No study groups yet. Create one and invite classmates."
              }
              action={
                !search && (
                  <button
                    type="button"
                    onClick={() => navigate("/study-groups/create")}
                    className="mt-2 px-4 py-2 rounded-full bg-sky-950 text-white text-sm font-bold cursor-pointer"
                  >
                    Create a group
                  </button>
                )
              }
            />
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/study-groups/${group.id}`)}
                className="cursor-pointer w-full"
              >
                <StudyGroupCard data={group} />
              </div>
            ))
          )}
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={() => navigate("/study-groups/create")}
          className="mt-6 mb-12 w-5/8 bg-sky-950 text-white font-bold text-sm rounded-3xl py-2.5 cursor-pointer hover:bg-sky-900 transition"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Create Study Group
        </button>
      </div>
    </div>
  );
}