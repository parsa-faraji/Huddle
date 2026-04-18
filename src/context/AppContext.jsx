import { createContext, useContext, useState } from "react";
import { studySessions as initialSessions } from "../data/studySessions";
import { studyGroups as initialGroups } from "../data/studyGroups";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [groups, setGroups] = useState(initialGroups);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [joinedSpots, setJoinedSpots] = useState([]);

  const joinGroup = (group) => {
    setJoinedGroups((prev) => {
      if (prev.find((g) => g.id === group.id)) return prev;
      return [group, ...prev];
    });
  };

  const joinSpot = (spot) => {
    setJoinedSpots((prev) => {
      if (prev.find((s) => s.id === spot.id)) return prev;
      return [spot, ...prev];
    });
  };

  const addGroup = (group) => {
    const nextId = groups.length ? Math.max(...groups.map((g) => g.id)) + 1 : 1;
    const newGroup = { id: nextId, ...group };
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const addSession = (session) => {
    setSessions((prev) => [{ id: prev.length + 1, ...session }, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        sessions,
        groups,
        joinedGroups,
        joinedSpots,
        joinGroup,
        joinSpot,
        addGroup,
        addSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
