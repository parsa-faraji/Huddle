import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

function GroupCard({ group }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/study-groups/${group.id}`)}
      className="text-left bg-white dark:bg-[--huddle-card] rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col gap-2"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <p className="font-bold text-black dark:text-[--huddle-text] text-base">
        {group.name ?? group.course}
      </p>
      {group.course && (
        <p className="text-xs text-[#5C4033] dark:text-[--huddle-text-sub]">
          Course: {group.course}
        </p>
      )}
      {group.meetingTime && (
        <p className="text-xs text-[#5C4033] dark:text-[--huddle-text-sub]">
          Next Meeting: {group.meetingTime}
        </p>
      )}
    </button>
  );
}

function RatedSessionCard({ session }) {
  const navigate = useNavigate();
  const targetId = session.spotId ?? session.id;
  return (
    <button
      type="button"
      onClick={() => targetId && navigate(`/study-spots/${targetId}`)}
      className="text-left bg-white dark:bg-[--huddle-card] rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col gap-2"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <p className="font-bold text-black dark:text-[--huddle-text] text-base">
        {session.spot}
      </p>
      <div className="flex flex-wrap text-xs gap-3 text-[#5C4033] dark:text-[--huddle-text-sub] mt-1">
        {session.productivity ? (
          <span>Productivity: {session.productivity}</span>
        ) : null}
        {session.comfort ? <span>Comfort: {session.comfort}</span> : null}
        {session.location ? <span>Location: {session.location}</span> : null}
        {session.recommend !== undefined && session.recommend !== null && (
          <span>Recommend: {session.recommend ? "Yes" : "No"}</span>
        )}
      </div>
    </button>
  );
}

function CompactSpotCard({ spot, rightSlot }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/study-spots/${spot.id}`)}
      className="w-full text-left bg-white dark:bg-[--huddle-card] rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition flex items-start gap-3"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <img
        src={spot.image ?? "/cat.webp"}
        alt=""
        loading="lazy"
        className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-white/5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-black dark:text-[--huddle-text] text-base truncate">
          {spot.name}
        </p>
        {spot.location && (
          <p className="text-xs text-[#5C4033] dark:text-[--huddle-text-sub] truncate">
            {spot.location}
          </p>
        )}
        {spot.hours && (
          <p className="text-xs text-[#5C4033] dark:text-[--huddle-text-sub] truncate">
            {spot.hours}
          </p>
        )}
      </div>
      {rightSlot}
    </button>
  );
}

function Section({ title, children, empty }) {
  return (
    <section className="w-full mt-10">
      <h2
        className="text-center text-black dark:text-[--huddle-text] font-medium text-lg mb-4"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-4">{empty ?? children}</div>
    </section>
  );
}

function EmptyLine({ text }) {
  return (
    <p
      className="text-[#5C4033] dark:text-[--huddle-text-sub] text-xs text-center"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {text}
    </p>
  );
}

export default function InsightsPage() {
  const { spots, joinedGroups, joinedSpots, sessions } = useApp();
  const { user, signOut } = useAuth();
  const { ids: favoriteIds, toggle: toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const favoriteSpots = useMemo(
    () => spots.filter((s) => favoriteIds.includes(s.id)),
    [spots, favoriteIds],
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[--huddle-bg]">
      <div
        className="w-full max-w-96 h-screen relative huddle-frame shadow-2xl
                   flex flex-col items-center pt-20 px-6 overflow-y-auto"
      >
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <Section
          title="Favorites"
          empty={
            favoriteSpots.length === 0 ? (
              <EmptyLine text="Tap the heart on a spot to save it here." />
            ) : undefined
          }
        >
          {favoriteSpots.map((spot) => (
            <CompactSpotCard
              key={spot.id}
              spot={spot}
              rightSlot={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Unfavorite ${spot.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(spot.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(spot.id);
                    }
                  }}
                  className={clsx(
                    "inline-flex items-center justify-center rounded-full p-2",
                    "bg-rose-100 text-rose-500 dark:bg-rose-500/10",
                    "hover:bg-rose-200 dark:hover:bg-rose-500/20 cursor-pointer",
                  )}
                >
                  <Heart size={16} fill="currentColor" />
                </span>
              }
            />
          ))}
        </Section>

        <Section
          title="Study Groups Joined"
          empty={
            joinedGroups.length === 0 ? (
              <EmptyLine text="You haven't joined any groups yet." />
            ) : undefined
          }
        >
          {joinedGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </Section>

        <Section
          title="Study Spots Joined"
          empty={
            joinedSpots.length === 0 ? (
              <EmptyLine text="You haven't joined any spots yet." />
            ) : undefined
          }
        >
          {joinedSpots.map((spot) => (
            <CompactSpotCard key={spot.id} spot={spot} />
          ))}
        </Section>

        <Section
          title="Study Spots Rated"
          empty={
            sessions.length === 0 ? (
              <EmptyLine text="You haven't rated any spots yet." />
            ) : undefined
          }
        >
          {sessions.map((session) => (
            <RatedSessionCard key={session.id} session={session} />
          ))}
        </Section>

        <div className="w-full mt-10 mb-24 flex flex-col items-center gap-2">
          {user?.email && (
            <p
              className="text-xs text-[#5C4033] dark:text-[--huddle-text-sub]"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Signed in as {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-sky-950 text-white dark:bg-[--huddle-gold] dark:text-slate-900 font-bold text-sm cursor-pointer hover:bg-sky-900 dark:hover:brightness-110 active:scale-[0.98] transition"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
