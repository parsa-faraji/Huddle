import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { subscribeSpots } from "../services/spots";
import {
  subscribeGroups,
  createGroup as svcCreateGroup,
  joinGroup as svcJoinGroup,
  leaveGroup as svcLeaveGroup,
} from "../services/groups";
import {
  subscribeUserDoc,
  joinSpot as svcJoinSpot,
  leaveSpot as svcLeaveSpot,
  updatePreferences as svcUpdatePreferences,
} from "../services/users";
import { subscribeUserSessions, submitRating as svcSubmitRating } from "../services/ratings";
import {
  checkIn as svcCheckIn,
  cancelCheckIn as svcCancelCheckIn,
  isStillActive,
  subscribeActiveCheckins,
} from "../services/checkins";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [spots, setSpots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userDoc, setUserDoc] = useState(null);
  const [spotsLoaded, setSpotsLoaded] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [now, setNow] = useState(() => Date.now());

  // Gate Firestore subscriptions on auth state. Security rules require a
  // signed-in user; subscribing before auth produces a permission-denied
  // error and the listener never recovers when the user signs in later.
  useEffect(() => {
    if (!user) {
      setSpots([]);
      setGroups([]);
      setUserDoc(null);
      setSessions([]);
      setSpotsLoaded(false);
      setGroupsLoaded(false);
      return;
    }
    const unsubSpots = subscribeSpots((s) => {
      setSpots(s);
      setSpotsLoaded(true);
    });
    const unsubGroups = subscribeGroups((g) => {
      setGroups(g);
      setGroupsLoaded(true);
    });
    const unsubUser = subscribeUserDoc(user.uid, setUserDoc);
    const unsubSessions = subscribeUserSessions(user.uid, setSessions);
    const unsubCheckins = subscribeActiveCheckins(setCheckins);
    return () => {
      unsubSpots();
      unsubGroups();
      unsubUser();
      unsubSessions();
      unsubCheckins();
    };
  }, [user]);

  // Re-render once a minute so expired check-ins drop out of counts client-side
  // even when Firestore hasn't pushed a new snapshot.
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [user]);

  const joinedGroupIds = userDoc?.joinedGroupIds ?? [];
  const joinedSpotIds = userDoc?.joinedSpotIds ?? [];
  const joinedGroups = groups.filter((g) => joinedGroupIds.includes(g.id));
  const joinedSpots = spots.filter((s) => joinedSpotIds.includes(s.id));

  const joinGroup = async (group) => {
    if (!user) return;
    await svcJoinGroup(group.id, user.uid, user.displayName || "");
  };

  const leaveGroup = async (group) => {
    if (!user) return;
    await svcLeaveGroup(group.id, user.uid, user.displayName || "");
  };

  const joinSpot = async (spot) => {
    if (!user) return;
    await svcJoinSpot(user.uid, spot.id);
  };

  const leaveSpot = async (spot) => {
    if (!user) return;
    await svcLeaveSpot(user.uid, spot.id);
  };

  const addGroup = async (data) => {
    if (!user) throw new Error("Not signed in");
    return svcCreateGroup(data, user.uid, user.displayName || "");
  };

  const addSession = async (session) => {
    if (!user) return;
    const { spotId, spot, ...rest } = session;
    if (!spotId) return;
    await svcSubmitRating(spotId, spot, user.uid, rest);
  };

  const updatePreferences = async (prefs) => {
    if (!user) return;
    await svcUpdatePreferences(user.uid, prefs);
  };

  const activeCheckins = checkins.filter((c) => isStillActive(c, now));

  const checkinCounts = activeCheckins.reduce((acc, c) => {
    acc[c.spotId] = (acc[c.spotId] ?? 0) + 1;
    return acc;
  }, {});

  const myCheckin = user
    ? activeCheckins.find((c) => c.userId === user.uid)
    : null;

  const checkInAtSpot = async (spotId) => {
    if (!user) return;
    await svcCheckIn(user.uid, spotId);
  };

  const cancelMyCheckin = async () => {
    if (!myCheckin) return;
    await svcCancelCheckIn(myCheckin.id);
  };

  return (
    <AppContext.Provider
      value={{
        spots,
        groups,
        sessions,
        userDoc,
        joinedGroups,
        joinedSpots,
        spotsLoaded,
        groupsLoaded,
        joinGroup,
        leaveGroup,
        joinSpot,
        leaveSpot,
        addGroup,
        addSession,
        updatePreferences,
        checkinCounts,
        myCheckin,
        checkInAtSpot,
        cancelMyCheckin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
