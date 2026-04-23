import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import {
  addFavoriteSpot,
  removeFavoriteSpot,
} from "../services/users";

export function useFavorites() {
  const { user } = useAuth();
  const { userDoc } = useApp();

  const ids = useMemo(
    () => userDoc?.favoriteSpotIds ?? [],
    [userDoc?.favoriteSpotIds],
  );

  const isFavorite = useCallback(
    (spotId) => ids.includes(spotId),
    [ids],
  );

  const toggle = useCallback(
    async (spotId) => {
      if (!user) return;
      if (ids.includes(spotId)) {
        await removeFavoriteSpot(user.uid, spotId);
      } else {
        await addFavoriteSpot(user.uid, spotId);
      }
    },
    [user, ids],
  );

  return { ids, isFavorite, toggle };
}
