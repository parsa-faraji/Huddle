/**
 * Core domain types for the Huddle application.
 *
 * These interfaces model the Firestore documents and API payloads used
 * across the frontend and backend.
 */

// ---------------------------------------------------------------------------
// Firebase / Auth
// ---------------------------------------------------------------------------

/** Subset of the Firebase User object used throughout the app. */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ---------------------------------------------------------------------------
// Firestore – Users
// ---------------------------------------------------------------------------

/** User document stored in the `users` collection. */
export interface UserProfile {
  email: string;
  createdAt: Date;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  /** Preferred noise level: 0 (silent) – 5 (loud). */
  noiseLevel?: number;
  /** Whether the user prefers spots with power outlets. */
  needsOutlets?: boolean;
  /** Preferred spot categories. */
  favoriteCategories?: StudySpotCategory[];
}

// ---------------------------------------------------------------------------
// Firestore – Study Spots
// ---------------------------------------------------------------------------

export type StudySpotCategory =
  | 'library'
  | 'cafe'
  | 'lounge'
  | 'outdoor'
  | 'lab'
  | 'other';

export interface StudySpot {
  id: string;
  name: string;
  description: string;
  category: StudySpotCategory;
  location: GeoPoint;
  address: string;
  /** Building or area name on campus. */
  building?: string;
  amenities: Amenities;
  /** URL to a photo of the spot. */
  photoURL?: string;
  /** Average rating (1-5) computed from reviews. */
  averageRating: number;
  /** Total number of ratings received. */
  ratingCount: number;
  /** Operating hours keyed by day-of-week (0 = Sunday). */
  hours?: Record<number, HoursRange>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface HoursRange {
  open: string; // "HH:MM" 24-hour format
  close: string;
}

export interface Amenities {
  wifi: boolean;
  outlets: boolean;
  whiteboards: boolean;
  quietZone: boolean;
  foodNearby: boolean;
  accessibility: boolean;
}

// ---------------------------------------------------------------------------
// Firestore – Ratings / Reviews
// ---------------------------------------------------------------------------

export interface Rating {
  id: string;
  spotId: string;
  userId: string;
  /** 1-5 star rating. */
  score: number;
  comment?: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Firestore – Study Groups
// ---------------------------------------------------------------------------

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  /** UID of the group creator. */
  ownerId: string;
  memberIds: string[];
  /** The study spot this group is associated with (optional). */
  spotId?: string;
  /** Scheduled session time. */
  scheduledAt?: Date;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// API payloads
// ---------------------------------------------------------------------------

export interface ProfileResponse {
  message: string;
}

export interface ApiError {
  error: string;
}

// ---------------------------------------------------------------------------
// Auth service callback types
// ---------------------------------------------------------------------------

import type { User } from 'firebase/auth';

export type AuthStateCallback = (user: User | null) => void;
export type Unsubscribe = () => void;
