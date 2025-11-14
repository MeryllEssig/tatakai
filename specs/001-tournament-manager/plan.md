# Implementation Plan: [FEATURE]

**Branch**: `001-tournament-manager` | **Date**: 2025-11-14 | **Spec**: `/specs/001-tournament-manager/spec.md`
**Input**: Feature specification from `/specs/001-tournament-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Local-first multi-tournament rating manager for multi-game events with players and teams.

The application is a mobile-first React single-page app built with Vite and TypeScript (React 19). It lets users:
- **Create and manage multiple tournaments** with flexible solo/team configurations.
- **Record games** and automatically update player ratings using **OpenSkill.js** (configurable modes per tournament).
- **View leaderboards and player statistics** (µ, σ, conservative µ-3σ, bench streaks, histories).
- **Run advanced matchmaking** that prioritizes bench fairness, then rating uncertainty, then rating balance.
- **Maintain full game history** and support deletion with **sequential rating recomputation**.

All data for the **active tournament** lives in a **Jotai store** that mirrors a `GameData` model and is persisted to browser `localStorage` under a **tournament-specific key** (e.g. `"mon-tournoi-1"`). Multiple tournaments can be stored concurrently under distinct keys, but only one is loaded into the Jotai store at a time; switching tournaments unloads the current data and loads the selected tournament from `localStorage`.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x with React 19  
**Primary Dependencies**: Vite (React + TS), React Router, Jotai, openskill, Tailwind CSS, shadcn/ui  
**Storage**: Browser `localStorage` behind a small AsyncStorage-like adapter, using a key per tournament (`"mon-tournoi-1"`) that stores the multi-tournament `GameData` object. We can have multiple tournaments stored concurrently, but the jotai store loads one only at a time. Changing tournament selection should switch the jotai store data to the selected tournament by loading the data from `localStorage` and unloading the previous data.
**Testing**: Vitest + @testing-library/react focused on pure business utilities (OpenSkill integration, matchmaking, sequential recomputation)  
**Target Platform**: Mobile-first web SPA targeting modern evergreen browsers (mobile and desktop)
**Project Type**: web  
**Performance Goals**: Meet spec success criteria (ratings update < 2s, full recomputation < 5s for up to 100 games, app launch < 2s, navigation and tournament switching < 1s)  
**Constraints**: Offline-capable, no backend, up to ~50 players per tournament and ~100 games, minimal bundle size to keep performance acceptable on mid-range mobile devices  
**Scale/Scope**: Single-user local app with a handful of tournaments stored concurrently, each up to ~50 players and 100 games

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1 – Web-First React Architecture**  
  - **Status**: PASS.  
  - **Details**: The constitution targets a mobile-first React web SPA with local storage behind a storage abstraction. This feature uses React 19 + Vite, Tailwind mobile-first, shadcn/ui, Jotai for state, and a localStorage-backed storage adapter. Business logic is kept framework-agnostic where possible.

- **Gate 2 – Simplicité avant tout**  
  - **Status**: PASS.  
  - **Details**: Single web app, no backend, clear domain modules (MMR/OpenSkill, matchmaking, players/teams, tournaments, persistence). Jotai is used as a thin state layer over pure business utilities.

- **Gate 3 – Business Utilities Testables**  
  - **Status**: PASS.  
  - **Details**: All rating calculations (OpenSkill integration), matchmaking logic, and sequential recomputation live in pure `lib/` modules with Vitest unit tests.

- **Gate 4 – Architecture Modulaire**  
  - **Status**: PASS.  
  - **Details**: Dedicated modules for tournaments, players/teams, games/history, matchmaking, ratings, and persistence. Jotai atoms orchestrate these modules without embedding complex logic directly in components.

## Project Structure

### Documentation (this feature)

```text
specs/001-tournament-manager/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
web/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── providers/
│   │   │   ├── jotai-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── router/
│   │   │   └── routes.tsx
│   │   └── layout/
│   │       └── app-shell.tsx
│   ├── features/
│   │   ├── tournaments/        # tournament list, creation wizard, settings
│   │   ├── players/            # player management within a tournament
│   │   ├── games/              # game recording + history views
│   │   ├── matchmaking/        # matchmaking UI + integration
│   │   ├── ratings/            # rating views & statistics
│   │   └── persistence/        # storage adapter, backups, corruption detection
│   ├── state/
│   │   ├── atoms.ts            # root Jotai atoms for StoredData + UI state
│   │   └── persistence.ts      # helpers to load/save atoms from localStorage
│   ├── lib/
│   │   ├── openskill/          # wrappers around openskill.js API
│   │   ├── matchmaking/        # pure matchmaking algorithms
│   │   └── recompute/          # sequential rating recomputation utilities
│   └── ui/
│       ├── components/         # shadcn-based primitives (Button, Card, Dialog…)
│       └── layout/             # responsive shells, nav, mobile-first layout
└── tests/
    ├── unit/
    │   ├── openskill/
    │   ├── matchmaking/
    │   └── recompute/
    └── integration/
        └── flows/              # core flows: create tournament, record game, delete game
```

**Structure Decision**: Single web SPA in `web/` using feature-based folders (`features/*`, `lib/*`, `state/*`, `ui/*`). No backend. Business logic lives in `lib/` and is covered by unit tests; Jotai atoms in `state/` compose this logic; UI components in `ui/` wrap shadcn primitives. This keeps the app modular and future-portable to React Native if needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None currently. | All constitution gates for this feature pass under the web-first React architecture. | N/A |

