# Kingdom Web - Project Rules

## Goal
Mobile-first persistent strategy game inspired by base-building and active battlefield strategy.

## Tech
- Frontend: web/PWA, mobile-first
- Game view: 2.5D isometric sprites/assets
- Deployment target: Vercel
- Source of truth: Git repository
- Backend later: Supabase/PostgreSQL

## AI collaboration
- ChatGPT coordinates architecture and integrations.
- Claude can implement isolated features and refactors.
- Gemini can assist with visual/UI alternatives and Android/web checks.
- Never let two agents edit the same file concurrently without comparing commits.

## Asset naming
public/assets/<category>/<name>/lv01.webp or png
Example: public/assets/townhall/lv1.webp

## Rules
1. Mobile portrait must work first.
2. UI must remain touch friendly.
3. Player economy and timers will become server-authoritative once backend is enabled.
4. Do not hardcode production secrets in frontend files.
5. Every major feature should be committed separately.
