# Backend Foundation

This branch is intentionally isolated from Claude's onboarding work.

## Planned Supabase integration
- Email/password registration and login
- Email verification
- Password recovery
- Session persistence
- Player profile persistence
- Kingdom persistence
- Server-owned resource persistence

## Security rules
- Frontend receives only the Supabase project URL and publishable key.
- Never expose service-role or secret keys in the browser.
- All exposed player tables use RLS.
- Player rows are ownership-scoped with auth.uid().
- Authorization must never rely on user_metadata.
- Economy and timers will later move behind server-authoritative RPC/Edge Function boundaries.

## Current status
The SQL design is staged in backend/schema.sql but has NOT been applied to a Supabase project.

A dedicated Kingdom Supabase project is required before applying the schema. The currently connected Supabase account contains a project named "nabyon"; it is not assumed to belong to this game.

## Integration contract for onboarding
Claude's onboarding feature should eventually persist:
- commander_name -> player_profiles.commander_name
- kingdom name -> kingdoms.name
- civilization key -> kingdoms.civilization_key
- starting region key -> kingdoms.starting_region_key
- completion -> player_profiles.onboarding_completed

Do not merge or deploy this branch until the onboarding PR has been reviewed.
