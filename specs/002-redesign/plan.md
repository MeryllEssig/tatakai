# Implementation Plan: Tournament UI Redesign & i18n (002)

**Branch**: `002-redesign` | **Date**: 2025-11-16 | **Spec**: `/specs/002-redesign/spec.md`

**Input**: Feature specification from `/specs/002-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Redesign the tournament UI and routing as a React/Vite web SPA so that:
- URLs are REST-style and deep-linkable for all tournament sub-views (overview, history, leaderboard, matchmaking, help, settings).
- The home page is a simple tournament list (create/import) instead of auto-opening the last tournament.
- The app is fully localized (FR/EN/JA) with a persistent language selector, consistent fallback behavior, and no language parameters in the URL.
- The visual identity is unified across the app (Tatakai logo, fonts, light neobrutalist design) using Retro UI and an icon system based on shadcn ant-design icons.

## Technical Context

**Language/Version**: TypeScript + React 19 on Vite 7 (web SPA)  
**Primary Dependencies**: React, React DOM, React Router DOM 7, Jotai for state, Tailwind CSS 4 + tailwind-merge/tailwindcss-animate, class-variance-authority, vitest + jsdom for tests, shadcn ant-design icon set, Retro UI (retroui) for light neobrutalist styling, **react-i18next + i18next + i18next-browser-languagedetector** for i18n  
**Storage**: Browser `localStorage` behind the existing storage abstraction (no new backend)  
**Testing**: vitest for non-trivial utilities (e.g. language resolution, routing helpers); UI behavior validated mainly via manual testing per constitution  
**Target Platform**: Web browser (desktop + mobile) as a single-page React app  
**Project Type**: web  
**Performance Goals**: Match spec success criteria: navigation between main pages within ~1s, app launch and last tournament access within ~2s, rendering stable at 60fps for typical tournament sizes  
**Constraints**: Keep routing/i18n/theme changes incremental over existing architecture; avoid introducing extra global state libraries; keep bundle size reasonable despite new icon/Retro UI dependencies  
**Scale/Scope**: Single-user browser app managing dozens of tournaments; up to ~50 players per tournament and ~100 games per tournament (from 001 feature)

### Testing workflow (002-redesign)

Pour la feature 002-redesign, **chaque cycle de développement** doit se terminer par :

1. L’exécution de la suite de tests vitest pertinente dans `web/` (au minimum les tests unitaires des utilitaires concernés).
2. La correction de tous les tests en échec avant de passer au cycle suivant (nouvelle tâche, nouveau commit ou nouveau lot de modifications).

Aucune évolution ne doit être considérée comme “terminée” tant que les tests ne sont pas verts pour cette feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Web-first React architecture with Vite: respected (feature stays inside existing `web` React SPA with React Router).
- Simplicité avant tout: routing/i18n/visual identity changes implemented as thin layers on top of existing modules (no new backend, no micro-frontends, no custom router).
- Business Utilities Testables: only non-trivial pure utilities (e.g. language resolution per FR-205, route builders for deep-linking) will receive vitest coverage; visual layout and static content (help, theme) remain manually tested.
- Architecture modulaire: introduce/extend small focused modules for routing configuration, i18n config, and theming (Retro UI + fonts) without cross-coupling with MMR/matchmaking logic.
- Storage abstraction: reuse existing localStorage abstraction; 002 MUST NOT introduce ad-hoc storage calls outside that layer.

No constitution violations identified at planning time; anything that would add complexity (e.g. new global state system or SSR layer) would require explicit re-evaluation.

## Project Structure

### Documentation (this feature)

```text
specs/002-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
web/
├── src/
│   ├── app/             # App shell, router, layout, providers
│   ├── features/        # Feature-specific UI/logic (tournaments, history, leaderboard, matchmaking, settings...)
│   ├── ui/              # Reusable UI components (buttons, layout, typography, Retro UI wrappers)
│   ├── lib/             # Shared utilities (storage abstraction, routing helpers, etc.)
│   ├── state/           # Jotai atoms and global state
│   ├── assets/          # Static assets (logo, fonts, images)
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/            # Unit tests (business/utils + critical helpers)
│   ├── integration/     # Integration tests for flows if needed
│   └── ui/              # Optional UI tests (routing/i18n sanity checks)
└── public/              # Public assets (favicons, static files)
```

**Structure Decision**: Single React web SPA in `/web` with feature-oriented folders under `src/features`, plus shared `app`, `ui`, `lib`, and `state` modules. 002-redesign will primarily touch routing, layout, i18n configuration, and theme/icon layers within this existing structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
