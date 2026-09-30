# Kingdom Web - Project Rules

## Goal
Mobile-first persistent strategy game inspired by base-building and active battlefield strategy.

## Tech
- Frontend: web/PWA, mobile-first
- Primary orientation: landscape-first
- Game view: 2.5D isometric sprites/assets
- Deployment target: Vercel / current preview deployment workflow
- Source of truth: Git repository
- Backend later: Supabase/PostgreSQL

## AI collaboration
- ChatGPT coordinates architecture, integrations, reviews, merging, and deployment.
- Claude implements isolated feature branches and refactors.
- Gemini can assist with visual/UI alternatives and Android/web checks.
- Never let two agents edit the same file concurrently without comparing commits.

## Asset naming
public/assets/<category>/<name>/lv01.webp or png
Example: public/assets/townhall/lv1.webp

## Rules
1. Mobile landscape must work first.
2. The viewport must stay edge-to-edge with no horizontal page scrolling.
3. UI must remain touch friendly.
4. Player economy and timers will become server-authoritative once backend is enabled.
5. Do not hardcode production secrets in frontend files.
6. Every major feature should be committed separately.
7. Feature agents must work on dedicated branches and must not deploy or merge without review.
