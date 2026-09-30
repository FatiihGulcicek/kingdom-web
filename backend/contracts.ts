export type AuthSessionState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; userId: string; email: string | null; emailVerified: boolean };

export interface PlayerProfileRecord {
  userId: string;
  commanderName: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KingdomRecord {
  id: string;
  userId: string;
  name: string;
  civilizationKey: string | null;
  startingRegionKey: string | null;
  townHallLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerResourcesRecord {
  userId: string;
  wood: number;
  stone: number;
  food: number;
  gold: number;
  updatedAt: string;
}

export interface OnboardingPersistenceInput {
  commanderName: string;
  kingdomName: string;
  civilizationKey: string;
  startingRegionKey: string;
}

export interface AuthGateway {
  getSession(): Promise<AuthSessionState>;
  signUp(email: string, password: string): Promise<AuthSessionState>;
  signIn(email: string, password: string): Promise<AuthSessionState>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
}

export interface PlayerRepository {
  getProfile(userId: string): Promise<PlayerProfileRecord | null>;
  getKingdom(userId: string): Promise<KingdomRecord | null>;
  getResources(userId: string): Promise<PlayerResourcesRecord | null>;
  saveOnboarding(userId: string, input: OnboardingPersistenceInput): Promise<void>;
}
