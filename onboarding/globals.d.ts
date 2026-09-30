// Globals shared between the classic (non-module) onboarding scripts.
import type * as M from './models';

declare global {
  interface Window {
    KingdomOnboarding: {
      data?: {
        BONUS_CATEGORIES: M.BonusCategory[];
        BONUS_LABELS: Record<M.BonusCategory, string>;
        RESOURCES: Record<M.ResourceType, { label: string; icon: string }>;
        BASE_RESOURCES: M.ResourceAmounts;
        CIVILIZATIONS: M.Civilization[];
        REGIONS: M.StartingRegion[];
        DIFFICULTY_LABELS: Record<M.RegionDifficulty, string>;
        KINGDOM_NAME_PARTS: { first: string[]; second: string[] };
      };
      store?: {
        repository: M.OnboardingRepository;
        validateCommanderName(value: string): string | null;
        validateKingdomName(value: string): string | null;
        startingResources(regionId: string): M.ResourceAmounts;
      };
      mount?: (root: HTMLElement, options: OnboardingMountOptions) => void;
    };
  }

  interface OnboardingMountOptions {
    /** Name from the auth screen, used to prefill step 1. */
    commanderName?: string;
    /** Called when the player leaves to the login screen. */
    onExit?: () => void;
  }
}

export {};
