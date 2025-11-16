---

description: "Task list for feature 001-tournament-manager"
---

# Tasks: Multi-Game Rating Manager with OpenSkill.js

**Input**: Design documents from `/specs/001-tournament-manager/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests are required for pure business utilities (OpenSkill integration, matchmaking, sequential recomputation) as per the project constitution. UI and wiring can be validated manually via quickstart flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the `web/` React SPA.

- [X] T001 Create Vite React + TypeScript app in `web/` aligned with plan.md structure
- [X] T002 Configure TypeScript and base linting/formatting in `web/tsconfig.json`, `web/eslint.config.js`, `web/.prettierrc*`
- [X] T003 [P] Install core dependencies (React 19, React DOM, React Router, Jotai, openskill, Tailwind CSS, Tailwind tooling) by updating `web/package.json`
- [X] T004 [P] Configure Tailwind CSS using the `@tailwindcss/vite` plugin and global styles in `web/src/index.css`
- [X] T005 [P] Initialize shadcn/ui-style UI primitives (Button, Card, Dialog, Input, Select) in `web/src/ui/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Implement React entrypoint and app shell in `web/src/main.tsx` and `web/src/app/layout/app-shell.tsx`
- [X] T007 [P] Implement Jotai provider component in `web/src/app/providers/jotai-provider.tsx`
- [X] T008 [P] Implement theme provider and base theming in `web/src/app/providers/theme-provider.tsx`
- [X] T009 Set up routing configuration for main screens in `web/src/app/router/routes.tsx`
- [X] T010 Define shared domain TypeScript types from `data-model.md` in `web/src/lib/domain/types.ts`
- [X] T011 [P] Implement localStorage tournament storage adapter (key-per-tournament equal to the tournament name normalized to alphanumeric characters without spaces, e.g. `"Mon Tournoi 1!"` → `"montournoi1"`) in `web/src/features/persistence/local-storage-adapter.ts`
- [X] T012 Implement root Jotai atoms for `GameData` and current tournament selection in `web/src/state/atoms.ts`
- [X] T013 [P] Implement persistence helpers to load/save Jotai atoms from localStorage (including lastOpenedTournamentId) in `web/src/state/persistence.ts`
- [X] T014 Implement OpenSkill.js wrapper utilities for rating updates in `web/src/lib/openskill/ratings.ts`
- [X] T015 Implement sequential recomputation utilities skeleton in `web/src/lib/recompute/recompute-ratings.ts`
- [X] T016 Implement matchmaking engine skeleton in `web/src/lib/matchmaking/engine.ts`
- [X] T017 [P] Configure Vitest and basic test setup for unit and integration tests in `web/vitest.config.*`, `web/tests/unit/`, `web/tests/integration/`

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Multi-Game Tournament Creation and Player Management (Priority: P1) 🎯 MVP

**Goal**: Allow users to create multi-game tournaments via a 2-step wizard (config + players) and manage participants; tournaments appear in a central list.

**Independent Test**: As per spec, user can create a tournament with correct settings, add players, and see the tournament in the list with accurate metadata.

### Implementation for User Story 1

- [X] T018 Implement `CreateTournament` and `AddOrUpdatePlayer` domain functions in `web/src/lib/tournaments/tournament-service.ts`
- [X] T019 [P] [US1] Add unit tests for tournament-service functions in `web/tests/unit/tournaments/tournament-service.test.ts`
- [X] T020 [US1] Implement tournament list screen (showing name, player count, game count, last game date) in `web/src/features/tournaments/tournament-list-screen.tsx`
- [X] T021 [P] [US1] Implement 2-step tournament creation wizard (settings → players) in `web/src/features/tournaments/create-tournament-wizard.tsx`
- [X] T022 [US1] Implement hook for tournament selection and lastOpenedTournamentId handling in `web/src/features/tournaments/use-tournament-selection.ts`
- [X] T023 [US1] Implement player management UI (add/edit/deactivate players with unique name validation) in `web/src/features/players/player-list-panel.tsx`
- [X] T024 [US1] Wire persistence of created/updated tournaments via `state/persistence` helpers in `web/src/features/tournaments/tournament-list-screen.tsx`

**Checkpoint**: User Story 1 should be fully functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Game Recording and OpenSkill.js Rating Updates (Priority: P1)

**Goal**: Allow recording of game results with flexible teams and automatically update player ratings and stats using OpenSkill.js.

**Independent Test**: User records games through a dedicated game result screen; ratings, bench streaks, and leaderboards update correctly.

### Implementation for User Story 2

- [X] T025 [US2] Implement `RecordGameResult` command using OpenSkill wrapper in `web/src/lib/games/game-service.ts`
- [X] T026 [P] [US2] Add unit tests for rating updates and bench streak tracking in `web/tests/unit/games/game-service.test.ts`
- [X] T027 [US2] Implement per-player rank-based game result entry screen with bench toggle and rank selector (1..rankMax) in `web/src/features/games/game-result-screen.tsx`, including per-tournament `rankMax` configuration in tournament settings and creation wizard
- [X] T028 [US2] Implement player statistics view (µ, σ, µ-3σ, bench streak, games played, rating history) in `web/src/features/ratings/player-stats-panel.tsx`
- [X] T029 [US2] Implement tournament leaderboard view sorted by rating with uncertainty and game count in `web/src/features/ratings/leaderboard-screen.tsx`
- [X] T030 [US2] Wire game save flow to persist updated `GameData` via `state/persistence` in `web/src/features/games/game-result-screen.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and provide core tournament + rating functionality.

---

## Phase 5: User Story 3 - Advanced Matchmaking with Team Composition and Bench Fairness (Priority: P2)

**Goal**: Suggest balanced matchmaking configurations that respect bench fairness, rating uncertainty, and rating balance.

**Independent Test**: Given configured parameters and candidates, the system suggests teams that prioritize bench fairness, then high-sigma players, then balanced team ratings.

### Implementation for User Story 3

- [X] T031 [US3] Implement `GenerateMatchmakingSuggestion` algorithm (bench fairness → sigma → rating balance) in `web/src/lib/matchmaking/engine.ts`
- [X] T032 [P] [US3] Add unit tests for matchmaking engine scenarios in `web/tests/unit/matchmaking/engine.test.ts`
- [X] T033 [US3] Implement matchmaking configuration and candidate selection UI in `web/src/features/matchmaking/matchmaking-screen.tsx`
- [X] T034 [US3] Implement display of suggested teams and bench recommendations in `web/src/features/matchmaking/matchmaking-screen.tsx`
- [X] T035 [US3] Implement "accept suggestion" flow to prefill game result screen in `web/src/features/matchmaking/use-accept-suggestion.ts`

**Checkpoint**: Matchmaking suggestions should be independently testable and usable on top of completed US1+US2 flows.

---

## Phase 6: User Story 4 - Complete Game History Management with Sequential Rating Recalculation (Priority: P2)

**Goal**: Provide a complete game history and support deletion of past games with full sequential rating recalculation.

**Independent Test**: User can view chronological history, delete a game, and see all ratings and stats recomputed as if the deleted game never happened.

### Implementation for User Story 4

- [X] T036 [US4] Implement `DeleteGameAndRecompute` logic in `web/src/lib/recompute/recompute-ratings.ts` (reset ratings and replay history)
- [X] T037 [P] [US4] Add unit tests validating sequential recomputation in `web/tests/unit/recompute/recompute-ratings.test.ts`
- [X] T038 [US4] Implement game history screen showing chronological games with teams and rankings in `web/src/features/games/game-history-screen.tsx`
- [X] T039 [US4] Implement delete game UI with confirmation and recomputation trigger in `web/src/features/games/game-history-screen.tsx`
- [X] T040 [US4] Ensure player stats and leaderboard views react to updated ratings after recomputation in `web/src/features/ratings/use-rating-snapshots.ts`

**Checkpoint**: All four user stories (US1–US4) should now be independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality.

- [X] T041 Documentation updates to reference `quickstart.md` in `web/README.md` or `web/docs/quickstart.md`
- [X] T042 [P] Code cleanup and type tightening across `web/src/**/*`
- [X] T043 [P] Performance checks and optimizations for rating updates and recomputation in `web/src/lib/` and `web/src/features/`
- [X] T044 [P] Add any missing unit tests for core business utilities (OpenSkill integration, matchmaking, recomputation) in `web/tests/unit/`
- [X] T045 Run full manual validation flows described in `specs/001-tournament-manager/quickstart.md`
- [X] T046 Implement tournament export to JSON clipboard in `web/src/features/tournaments/export-tournament.ts` and wire it into the tournament settings UI
- [X] T047 Implement tournament reset flow with confirmation in `web/src/features/tournaments/tournament-settings-panel.tsx` and ensure it clears `GameData` and updates local storage
- [X] T048 [P] Implement backup and automatic recovery logic in `web/src/features/persistence/local-storage-adapter.ts` following R-004 (primary + `"-backup"` key per tournament)
- [X] T049 [P] Add unit tests for critical edge cases (deleted players with history, insufficient players for matchmaking, settings changes after games) in `web/tests/unit/edgecases/`
- [X] T050 Implement tournament import from JSON in `web/src/features/tournaments/import-tournament.ts` and add an "Importer un tournoi" button in `web/src/features/tournaments/tournament-list-screen.tsx` that overwrites any existing tournament when the imported JSON has the same id.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories.
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion.
  - US1 (Phase 3, P1) should be implemented first as the MVP.
  - US2 (Phase 4, P1) can start after foundational but benefits from US1 being available.
  - US3 (Phase 5, P2) depends on rating data from US2 and tournament structure from US1.
  - US4 (Phase 6, P2) depends on game recording (US2) and recomputation utilities from foundational.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependencies on other stories.
- **User Story 2 (P1)**: Depends on US1 for tournaments/players and foundational rating utilities.
- **User Story 3 (P2)**: Depends on US1 (tournaments/players) and US2 (ratings/history) to have meaningful input.
- **User Story 4 (P2)**: Depends on US2 (game history and rating updates) and foundational recompute utilities.

### Within Each User Story

- Business utility tests (if included) SHOULD be written close to the implementation and must validate the core algorithms.
- Models/utilities before UI wiring.
- UI flows should be kept simple and driven by the domain contracts.
- Story should be independently testable via quickstart flows before moving to the next.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel within Phase 2.
- Once Foundational completes, user stories can progress in parallel where dependencies allow (e.g., US3 can start once US2 rating flow is stable).
- Within a story, tasks marked [P] can run in parallel (tests vs implementation in different files).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL – blocks all stories).
3. Complete Phase 3: User Story 1 (tournament creation + players).
4. **STOP and VALIDATE**: Test User Story 1 independently using the tournament creation flow.
5. Ship/validate MVP if desired.

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready.
2. Add User Story 1 → validate MVP (tournament + players).
3. Add User Story 2 → validate game recording + ratings.
4. Add User Story 3 → validate matchmaking suggestions.
5. Add User Story 4 → validate history and recomputation.

Each story can be demonstrated and validated independently without breaking previous stories.
