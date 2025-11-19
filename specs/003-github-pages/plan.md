# Implementation Plan: React SPA Deployment on GitHub Pages

**Branch**: `003-github-pages` | **Date**: 2025-11-19 | **Spec**: `./spec.md`
**Input**: Feature specification from `./spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deploy the existing tatakai React single-page application (Vite + React Router) to GitHub Pages using an automated GitHub Actions workflow. On every push to the main branch, the pipeline builds the `web/` app for production, publishes the static assets to GitHub Pages under `/tatakai/`, and ensures SPA-friendly routing (deep links and refresh on internal routes without GitHub 404s).

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19 + Vite 7 (Node.js LTS for CI)  
**Primary Dependencies**: React, React DOM, React Router DOM, Vite, Vitest, Tailwind CSS, GitHub Actions, GitHub Pages  
**Storage**: N/A for this feature (no backend or new persistence; existing localStorage usage is unchanged)  
**Testing**: Vitest unit tests in `web/tests/unit` (run via `npm test` or `npm run test` in CI)  
**Target Platform**: Static site hosting on GitHub Pages, modern desktop and mobile browsers  
**Project Type**: Web SPA (frontend-only, deployed as static assets)  
**Performance Goals**: Deployment pipeline completes within 10 minutes per push; SPA routes under `/tatakai/` load without 404s and with typical static-site performance  
**Constraints**: Static hosting only (no server-side rendering or dynamic backend); keep CI configuration minimal and readable; respect existing Vite/React project conventions  
**Scale/Scope**: Single public SPA with a finite set of routes (dozens at most); modest traffic; no multi-tenant or multi-environment deployment in scope

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Web-First React Architecture**: ✅ Aligned (existing React + Vite SPA deployed as static assets to GitHub Pages).
- **Simplicity before all**: ✅ Single GitHub Actions workflow, no additional services or infrastructure beyond GitHub Pages.
- **Business Utilities Testable**: ✅ This feature adds CI/deployment configuration only; no new business algorithms are introduced.
- **Modular Architecture**: ✅ Deployment logic is isolated to workflow/config files; the existing domain modules remain unchanged.

Gate status: **PASS** — no constitution violations introduced or required for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── ui/
│   └── lib/
├── public/
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: The repository hosts a single React SPA in `web/` built with Vite. This feature adds only CI/workflow and static hosting configuration for deployment; it does not introduce new top-level projects or change the existing app/module layout.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
