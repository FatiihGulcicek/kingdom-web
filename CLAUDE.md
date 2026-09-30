# CLAUDE.md

## Role
You are the implementation agent for Kingdom Web. Follow this file and PROJECT_RULES.md before writing code.

## Current task: Onboarding foundation
Create the first-player onboarding flow without changing the existing loading/login/register implementation.

### Workflow
1. Commander name
2. Kingdom name
3. Civilization selection
4. Starting region selection
5. Review/confirmation
6. Continue to the first village placeholder

### Data models
Create clean TypeScript models/interfaces for:
- PlayerProfile
- Kingdom
- Civilization
- StartingRegion

Civilizations must support expandable bonuses:
- economy
- military
- defense
- research

Do not connect Supabase or any real backend yet. Use local prototype state only, structured so backend persistence can replace it later.

## UI requirements
- Mobile-first, LANDSCAPE-FIRST.
- The game must fit edge-to-edge with no horizontal page scroll or side-to-side viewport movement.
- Optimize for 16:9 and modern mobile landscape ratios.
- Touch targets must be comfortable.
- Medieval/fantasy strategy visual language, but do not copy Clash of Clans or Age of Empires UI/assets.
- Reuse the current visual system where practical instead of rebuilding authentication screens.

## Git workflow
- Do NOT work directly on main.
- Create branch: feature/onboarding
- Branch from: v1-foundation
- Do not merge to main.
- Do not deploy.
- Commit completed work.
- Open a pull request targeting v1-foundation if the connector supports it.

## File safety
- Do not rewrite or refactor loading/login/register unless required for a tiny integration hook.
- Prefer new onboarding-specific modules/files.
- Do not modify deployment configuration.
- Do not add production secrets or credentials.
- Do not replace existing project rules.

## Completion report
When finished, report:
- branch name
- commit SHA
- pull request URL if created
- files created/modified
- short summary of implementation
- any known issues or follow-up work

## Coordination
ChatGPT coordinates architecture, backend integration, code review, merging, and deployment.
Avoid editing files that another agent is actively changing unless explicitly instructed.
