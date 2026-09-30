# Auth + Onboarding Integration Contract

## Auth flow
1. App loads.
2. Auth adapter resolves the current Supabase session.
3. No session -> show login/register.
4. Authenticated user with no completed profile -> show onboarding.
5. Authenticated user with onboarding_completed=true -> load the village.

## Registration
- Create user with email/password.
- Respect Supabase email confirmation settings.
- Do not create privileged metadata in user_metadata.
- After an authenticated session exists, create the player's profile/kingdom/resources rows using that user's id.

## Login
- Use password sign-in.
- On success, fetch player_profiles by auth.uid().
- Never trust a user id supplied by the browser for authorization. RLS remains authoritative.

## Password recovery
- Send a recovery email through Supabase Auth.
- The final implementation must configure an allowed redirect URL for the deployed game domain.

## Frontend key policy
Allowed in browser:
- project URL
- publishable key

Forbidden in browser:
- secret key
- service-role key
- database password

## Onboarding handoff
Claude's onboarding UI returns:
- commanderName
- kingdomName
- civilizationKey
- startingRegionKey

Persistence writes:
- player_profiles.commander_name
- player_profiles.onboarding_completed = true
- kingdoms.name
- kingdoms.civilization_key
- kingdoms.starting_region_key
- create initial player_resources row

## Future server-authoritative boundary
The initial prototype may read resources directly under RLS.
Before PvP/economy launch, resource mutations, construction timers, rewards and battle results move behind database functions or Edge Functions so the browser cannot award itself resources.
