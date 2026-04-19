import type { Spot } from '../services/spots';
import type { UserPreferences } from '../services/users';

// Preference axes that exist on BOTH the spot document and the preferences
// object. seating/wifi live on ratings, not on spots, so they're skipped
// until those signals are aggregated back onto the spot doc.
const COMPARABLE_AXES: Array<keyof UserPreferences> = [
  'noiseLevel',
  'outlets',
  'lighting',
  'crowded',
];

function norm(v: unknown): string {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return String(v ?? '').trim().toLowerCase();
}

export function hasAnyPreferences(prefs: UserPreferences | undefined | null): boolean {
  if (!prefs) return false;
  return COMPARABLE_AXES.some((k) => {
    const v = prefs[k];
    return v !== undefined && v !== null && v !== '';
  });
}

export function scoreSpot(spot: Spot, prefs: UserPreferences | undefined | null): number {
  if (!prefs) return 0;
  let score = 0;
  for (const axis of COMPARABLE_AXES) {
    const p = prefs[axis];
    if (p === undefined || p === null || p === '') continue;
    const spotValue = (spot as unknown as Record<string, unknown>)[axis];
    if (spotValue === undefined || spotValue === null) continue;
    if (norm(p) === norm(spotValue)) score += 1;
  }
  return score;
}

export function rankSpotsByPreferences(
  spots: Spot[],
  prefs: UserPreferences | undefined | null,
): Spot[] {
  if (!hasAnyPreferences(prefs)) return spots;
  return [...spots]
    .map((s) => ({ s, score: scoreSpot(s, prefs) }))
    .sort((a, b) => b.score - a.score)
    .map(({ s }) => s);
}

export function topRecommendations(
  spots: Spot[],
  prefs: UserPreferences | undefined | null,
  limit = 3,
): Spot[] {
  if (!hasAnyPreferences(prefs)) return [];
  return rankSpotsByPreferences(spots, prefs)
    .filter((s) => scoreSpot(s, prefs) > 0)
    .slice(0, limit);
}

/**
 * Aggregate a list of member preferences into a single synthetic preference.
 * Mode per axis; ties broken by first-seen order.
 */
export function aggregatePreferences(
  memberPrefs: Array<UserPreferences | undefined | null>,
): UserPreferences {
  const out: UserPreferences = {};
  for (const axis of COMPARABLE_AXES) {
    const counts = new Map<string, number>();
    for (const p of memberPrefs) {
      const v = p?.[axis];
      if (v === undefined || v === null || v === '') continue;
      counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    if (counts.size === 0) continue;
    let best: string | undefined;
    let bestCount = 0;
    for (const [val, c] of counts) {
      if (c > bestCount) {
        best = val;
        bestCount = c;
      }
    }
    if (best !== undefined) out[axis] = best;
  }
  return out;
}
