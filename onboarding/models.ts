/**
 * Kingdom Web · Onboarding data models
 *
 * These interfaces are the contract for onboarding data. The runtime prototype
 * (onboarding/*.js) is plain JavaScript typed against this file via JSDoc, so it
 * runs without a build step. When Supabase is enabled, a backend repository only
 * has to implement `OnboardingRepository`; the UI does not change.
 */

/** Resource types used across the economy. */
export type ResourceType = 'wood' | 'stone' | 'food' | 'gold';

export type ResourceAmounts = Record<ResourceType, number>;

/** Bonus categories. New categories can be added here without UI changes. */
export type BonusCategory = 'economy' | 'military' | 'defense' | 'research';

export interface CivilizationBonus {
  /** Stable id, e.g. "eco-gather-wood". Used for server-side lookups later. */
  id: string;
  category: BonusCategory;
  /** Player-facing text, e.g. "Odun toplama hızı". */
  label: string;
  /** Machine-readable stat key the simulation will read, e.g. "gather.wood". */
  stat: string;
  value: number;
  unit: 'percent' | 'flat';
}

/**
 * Bonuses grouped by category. Every category is present (possibly empty),
 * so consumers can iterate categories without null checks.
 */
export type CivilizationBonuses = Record<BonusCategory, CivilizationBonus[]>;

export interface Civilization {
  id: string;
  name: string;
  /** One-line identity shown on the selection card. */
  tagline: string;
  description: string;
  /** Single glyph used as the emblem until real art exists. */
  emblem: string;
  /** Banner color (hex) used in UI previews. */
  color: string;
  /** Primary playstyle, used for the card label. */
  focus: BonusCategory;
  bonuses: CivilizationBonuses;
}

export type Terrain = 'plains' | 'forest' | 'highlands' | 'coast';
export type RegionDifficulty = 'easy' | 'normal' | 'hard';

export interface StartingRegion {
  id: string;
  name: string;
  terrain: Terrain;
  description: string;
  difficulty: RegionDifficulty;
  /** Multipliers applied to starting resources, e.g. { wood: 0.25 } = +25%. */
  resourceModifiers: Partial<ResourceAmounts>;
  /** Civilizations that pair well with this region (shown as a hint only). */
  recommendedCivilizationIds: string[];
}

export interface Kingdom {
  id: string;
  name: string;
  ownerId: string;
  civilizationId: string;
  regionId: string;
  level: number;
  /** Prototype-only. Becomes server-authoritative once the backend is enabled. */
  resources: ResourceAmounts;
  createdAt: string; // ISO 8601
}

export interface PlayerProfile {
  id: string;
  commanderName: string;
  kingdomId: string | null;
  onboardingCompleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type OnboardingStepId =
  | 'commander'
  | 'kingdom'
  | 'civilization'
  | 'region'
  | 'review';

/** In-progress choices, saved after every step so a reload resumes. */
export interface OnboardingDraft {
  step: OnboardingStepId;
  commanderName: string;
  kingdomName: string;
  civilizationId: string | null;
  regionId: string | null;
}

export interface OnboardingResult {
  profile: PlayerProfile;
  kingdom: Kingdom;
}

/**
 * Persistence boundary. The prototype uses localStorage; a Supabase
 * implementation replaces it later. Methods are async on purpose.
 */
export interface OnboardingRepository {
  loadDraft(): Promise<OnboardingDraft | null>;
  saveDraft(draft: OnboardingDraft): Promise<void>;
  /** Validates the draft, creates profile + kingdom, clears the draft. */
  complete(draft: OnboardingDraft): Promise<OnboardingResult>;
  loadResult(): Promise<OnboardingResult | null>;
  reset(): Promise<void>;
}
