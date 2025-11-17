# Tasks: Tournament UI Redesign & i18n (002)

**Input**: Design documents from `/specs/002-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Only critical utility logic (e.g. language resolution, route builders) requires unit tests per constitution. Most UI work will be validated manually using `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and base project state for 002-redesign.

- [X] T001 Ensure `web` dependencies are installed (icons & Retro UI ready to add) in `web/package.json`
- [X] T002 [P] Verify Vite/React Router/Jotai/Tailwind toolchain works by running `npm run dev` in `web/`
- [X] T003 [P] Confirm vitest test runner works in `web/` by running `npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be ready before story-specific work.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Add shadcn ant-design icon dependency and minimal setup in `web/package.json` and `web/src/ui/components/*`
- [X] T005 [P] Add Retro UI (retroui) dependency to `web/package.json` and integrate its Tailwind/Vite setup in `web/vite.config.ts` and `web/tailwind.config` (if needed)
- [X] T006 [P] Define global font imports (Syne, Darker Grotesque, Noto Sans JP) in `web/src/index.css` or `web/src/App.css`
- [X] T007 Create i18n infrastructure skeleton using `react-i18next`/`i18next`: initialize the i18n instance in `web/src/i18n.ts` and expose a `t()` helper via React integration
- [X] T008 [P] Implement `LanguagePreference` storage helper using the existing storage abstraction (backed by localStorage) plus browser detection in `web/src/lib/language-preference.ts` and `web/src/features/persistence/local-storage-adapter.ts`
- [X] T009 Wire new i18n provider into the app shell in `web/src/app/providers/*` and `web/src/app/layout/app-shell.tsx`

**Checkpoint**: Router, i18n shell, and design system dependencies are in place.

---

## Phase 3: User Story 1 – Stay on the same view after refresh (Priority: P1) 🎯 MVP

**Goal**: URLs encode tournament and sub-view so refresh/paste preserves the exact view.

**Independent Test**: Use `/tournament/abc/history` and `/tournament/abc/leaderboard` directly; refresh or open in new tab and confirm correct view.

### Implementation for User Story 1

 - [X] T011 [P] [US1] Define route config for tournament overview/history/leaderboard/matchmaking/settings in `web/src/app/router/routes.tsx`
 - [X] T012 [P] [US1] Implement a typed `buildTournamentRoute` helper (history/leaderboard/etc.) in `web/src/lib/route-builders.ts`
 - [X] T013 [US1] Ensure history screen reads tournament ID from route params and not from previous UI state in `web/src/features/games/*` (history view component)
 - [X] T014 [US1] Ensure leaderboard screen reads tournament ID from route params and not from previous UI state in `web/src/features/ratings/*` (leaderboard component)
 - [X] T016 [US1] Make the router default for unknown tournament IDs render the "Tournament not found" view on `/tournament/:id/...` in `web/src/app/router/routes.tsx`
 - [X] T017 [P] [US1] Add a small vitest suite for `buildTournamentRoute` in `web/tests/unit/route-builders.test.ts`

**Checkpoint**: Navigating, refreshing, or pasting deep links to `/tournament/:id/...` should be stable and predictable.

---

## Phase 4: User Story 2 – Home focused on tournament list (Priority: P1)

**Goal**: Home `/` only shows tournament list + new/import actions; clicking a tournament navigates to `/tournament/{id}` overview.

**Independent Test**: Hitting `/` shows only the list and create/import actions; navigating to a tournament opens its overview page.

### Implementation for User Story 2

- [X] T018 [P] [US2] Ensure `"/"` route renders only the tournament list screen in `web/src/app/router/routes.tsx` and `web/src/features/tournaments/tournament-list-screen.tsx`
- [X] T019 [US2] Wire "New tournament" button to navigate to `/new-tournament` (canonical route) instead of any legacy path in `web/src/features/tournaments/tournament-list-screen.tsx`
- [X] T020 [US2] Wire "Import tournament" button to the appropriate import flow (under home) in `web/src/features/tournaments/tournament-list-screen.tsx`
- [X] T021 [P] [US2] Ensure clicking a tournament row navigates to `/tournament/{id}` (overview) in `web/src/features/tournaments/tournament-list-screen.tsx`
- [X] T022 [US2] Implement `/new-tournament` route and screen composition using the existing 2-step creation wizard in `web/src/app/router/routes.tsx` and `web/src/features/tournaments/create-tournament-wizard.tsx`

**Checkpoint**: Home behaves as a clean entry point with clear navigation to tournament overview and creation.

---

## Phase 5: User Story 3 – Multilingual site with language selector (Priority: P1)

**Goal**: Site available in FR/EN/JA with a language selector overriding browser defaults, persisted across sessions.

**Independent Test**: Selector switches languages without full reload; preference is reused after refresh and new visits.

### Implementation for User Story 3

- [X] T024 [P] [US3] Define translation dictionaries for FR/EN/JA covering existing UI strings (home, tournament, history, leaderboard, matchmaking, help, settings) as JSON resources in `web/src/assets/locales/{fr,en,ja}/translation.json`
- [X] T025 [US3] Validate and, if needed, refine `LanguagePreference` resolution logic (stored preference via storage abstraction > browser language > fallback) in `web/src/lib/language-preference.ts` so that it matches the documented FR-205 behavior
- [X] T026 [P] [US3] Connect the `react-i18next`/`i18next` layer (configured in `web/src/i18n.ts`) to the app shell and expose a `useTranslation()`/`t()` helper in React components
- [X] T027 [US3] Implement a header language selector (flags + names) using shadcn/Retro UI components in `web/src/ui/components/language-selector.tsx`, wiring it to `react-i18next` to change language
- [X] T028 [P] [US3] Wire the language selector into the app header layout so it is visible on all main pages in `web/src/app/layout/app-shell.tsx`
- [X] T029 [US3] Replace hard-coded strings on the home and tournament list screens with calls to `t()`/`useTranslation()` in `web/src/features/tournaments/tournament-list-screen.tsx`
 - [X] T030 [US3] Replace hard-coded strings on history/leaderboard/matchmaking/settings/game-result/player-list/player-stats screens with `t()`/`useTranslation()` calls in the relevant `web/src/features/*` components
- [X] T031 [P] [US3] Add vitest unit tests for `LanguagePreference` resolution (including unsupported stored language and unsupported browser locale) to ensure correct priority and fallback per FR-205 in `web/tests/unit/language-preference.test.ts`

**Checkpoint**: UI language is correctly determined, switchable, and persisted.

---

## Phase 6: User Story 4 – Tatakai visual identity & light theme neobrutalism (Priority: P2)

**Goal**: Apply the Tatakai brand (戦 logo, typography) and consistent light theme neobrutalist design via Retro UI across the app.

**Independent Test**: Any main page clearly shows the brand and light theme neobrutalist style.

### Implementation for User Story 4

- [ ] T032 [P] [US4] Implement header logo block (戦 + "Tatakai" + "Tournament Manager") in `web/src/ui/components/app-header.tsx`
- [ ] T033 [US4] Integrate header component into app shell layout in `web/src/app/layout/app-shell.tsx`
- [ ] T034 [P] [US4] Configure font stacks (Syne for headings, Darker Grotesque for body, Noto Sans JP fallback) in `web/src/index.css` or `web/src/App.css`
- [ ] T035 [US4] Apply Retro UI base styles and components to main layout blocks in `web/src/app/layout/app-shell.tsx` and `web/src/ui/components/*`
- [ ] T036 [P] [US4] Adjust key pages (home, tournament overview, history, leaderboard, matchmaking, help, settings) to follow light neobrutalist blocks/borders/shadows/colors using Retro UI in the corresponding `web/src/features/*` components

**Checkpoint**: Visual identity is consistent and recognizable across core flows.

---

## Phase 7: User Story 5 – Integrated Help page (Priority: P2)

**Goal**: Provide a `/help` page explaining principles, ranking, and matchmaking in a non-technical way.

**Independent Test**: A user unfamiliar with OpenSkill or matchmaking can understand the concepts from the help page.

### Implementation for User Story 5

- [ ] T037 [P] [US5] Define `HelpContent` data structures and localized content for principles/ranking/matchmaking in `web/src/features/help/help-content.ts`
- [ ] T038 [US5] Implement `/help` route and page layout using Retro UI blocks in `web/src/app/router/routes.tsx` and `web/src/features/help/help-page.tsx`
- [ ] T039 [US5] Ensure help content is fully translated via `t()` or localized content modules in `web/src/features/help/help-page.tsx`
- [ ] T040 [P] [US5] Add navigation entry to `/help` (header or footer link) in `web/src/ui/components/app-header.tsx`

**Checkpoint**: Help page reachable from anywhere, with clear structured content.

---

## Phase 8: User Story 6 – Iconified buttons & player avatars (Priority: P3)

**Goal**: Buttons show meaningful icons; players have stable avatars derived from their names.

**Independent Test**: On main flows, most primary actions and player rows show icons and avatars consistently.

### Implementation for User Story 6

- [ ] T041 [P] [US6] Implement a `TatakaiIcon` wrapper component using shadcn ant-design icons in `web/src/ui/components/tatakai-icon.tsx`
- [ ] T042 [US6] Apply icons to primary action buttons (create/import tournament, add player, save game, launch matchmaking, reset) in `web/src/features/tournaments/tournament-list-screen.tsx`, `web/src/features/players/*`, `web/src/features/games/*`, and `web/src/features/matchmaking/*`
- [ ] T043 [P] [US6] Implement `PlayerAvatarView` component that deterministically generates avatars from player name/ID in `web/src/ui/components/player-avatar.tsx`
- [ ] T044 [US6] Integrate `PlayerAvatar` into player list, leaderboard, stats, and matchmaking UIs in `web/src/features/players/*`, `web/src/features/ratings/*`, and `web/src/features/matchmaking/*`

**Checkpoint**: Icons and avatars significantly improve scanability of main screens.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and cross-story improvements.

- [ ] T045 [P] Review all routes and links to ensure they match contracts in `specs/002-redesign/contracts/routes.md`
- [ ] T046 [P] Run through `quickstart.md` checklist and fix any discrepancies in `web/` code, addressing SC-201..206
- [ ] T047 Address accessibility items (focus states, contrast, aria-labels on icons) in `web/src/ui/components/*` and key `web/src/features/*` screens
- [ ] T048 Clean up any dead code or unused routes/components related to old home/routing and remove any `lastOpenedTournamentId`/"last opened tournament" state usage in storage or state in `web/src/app/router/routes.tsx`, `web/src/features/persistence/*` and `web/src/features/*`
- [ ] T049 [P] Ensure vitest suite remains green and add any missing unit tests for route/i18n helpers in `web/tests/unit/*`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** – No dependencies; can start immediately.
- **Phase 2: Foundational** – Depends on Phase 1; blocks all user stories.
- **User Stories (Phases 3–8)** – Depend on foundational work; can proceed in parallel by story once Phase 2 is complete.
- **Phase 9: Polish** – Depends on desired user stories being implemented.

### User Story Dependencies

- **US1 (P1)** – Needs routing foundation; otherwise independent.
- **US2 (P1)** – Depends on basic routing and tournaments feature; builds on US1 only conceptually.
- **US3 (P1)** – Depends on i18n foundation; can progress in parallel with US1/US2 once provider exists.
- **US4 (P2)** – Depends on Retro UI and font setup (Phase 2), but can be implemented alongside US2/US3.
- **US5 (P2)** – Depends on routing and i18n; otherwise independent.
- **US6 (P3)** – Depends on icon setup and player/tournament UIs being in place.

### Parallel Opportunities

- Setup tasks T001–T003 can be run in parallel.
- Foundational tasks T004–T010 marked [P] can be split across contributors.
- After Phase 2, US1–US3 work can proceed in parallel in different files.
- Within each story, tasks marked [P] can be executed concurrently as they touch different modules.

---

## Implementation Strategy

### MVP First (User Story 1 + Home)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Implement Phase 3 (US1 – deep-linking) and Phase 4 (US2 – home) to get a stable, shareable tournament experience.
4. Validate via `quickstart.md` and manual navigation tests.

### Incremental Delivery

- Add US3 for i18n → validate translations and selector.
- Add US4 for full visual identity → validate visual consistency.
- Add US5 help page → validate onboarding.
- Add US6 icons & avatars → validate UX polish.
