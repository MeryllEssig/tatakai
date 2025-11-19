---
description: "Task list for React SPA deployment to GitHub Pages"
---

# Tasks: React SPA Deployment on GitHub Pages

**Input**: Design documents from `./`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: This feature reuses existing unit tests (Vitest) by running `npm run test` in CI. No new test files are required unless explicitly added during implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions whenever they touch the codebase

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the existing `web/` app and scripts are ready to be wired into CI and deployment.

- [x] T001 Verify that `web/package.json` defines `build` and `test` scripts used by CI (`npm run build`, `npm run test`) and adjust as needed in `web/package.json`.
- [x] T002 [P] Run `npm install`, `npm run test`, and `npm run build` locally from `web/` and fix any issues in `web/package.json` or `web/src/*` before enabling deployment.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the baseline deployment workflow and documentation that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T003 Create the GitHub Actions workflow file `.github/workflows/deploy-pages.yml` with a minimal `deploy` job scaffold (name, `runs-on`, and empty steps list).
- [x] T004 [P] Add a short note in `specs/003-github-pages/contracts/github-pages-deployment.md` describing the new `deploy-pages` workflow file and its role in deploying to GitHub Pages.

**Checkpoint**: Workflow scaffold exists and is documented; ready to implement user-story-specific behaviour.

---

## Phase 3: User Story 1 - Automatic deployment on push to main (Priority: P1) 🎯 MVP

**Goal**: Every push to the `main` branch automatically builds and deploys the latest version of the `web/` SPA to GitHub Pages at `https://meryllessig.github.io/tatakai/`.

**Independent Test**: Push a non-trivial commit to `main` and observe a successful `deploy-pages` workflow run that results in an updated site at `https://meryllessig.github.io/tatakai/`.

### Implementation for User Story 1

- [x] T005 [US1] Configure the workflow trigger so `.github/workflows/deploy-pages.yml` runs on `push` events to the `main` branch only.
- [x] T006 [P] [US1] Add `actions/checkout` and `actions/setup-node` (Node.js LTS) steps to the `deploy-pages` job in `.github/workflows/deploy-pages.yml`.
- [x] T007 [P] [US1] Add steps in `.github/workflows/deploy-pages.yml` to install dependencies from `web/` using `npm ci` (with `npm install` fallback if needed) and run `npm run test` in `web/`.
- [x] T008 [US1] Add a `npm run build` step in `.github/workflows/deploy-pages.yml` that builds the SPA from `web/` and outputs static assets to `web/dist`.
- [x] T009 [US1] Configure GitHub Pages deployment in `.github/workflows/deploy-pages.yml` using `actions/upload-pages-artifact` (uploading `web/dist`) and `actions/deploy-pages` targeting the `github-pages` environment.
- [ ] T010 [US1] Push a test commit to `main` and verify in the GitHub Actions UI (deploy-pages workflow for `meryllessig/tatakai`) that the run succeeds and that `https://meryllessig.github.io/tatakai/` shows the updated app.

**Checkpoint**: Automatic deployment from `main` to GitHub Pages is working end-to-end.

---

## Phase 4: User Story 2 - Reliable access via public URL and internal routes (Priority: P2)

**Goal**: The SPA loads correctly from `/tatakai/`, and direct/deep links such as `/tatakai/profile` or `/tatakai/settings` work and survive browser refresh without GitHub 404 pages.

**Independent Test**: After a successful deployment, navigate directly to `https://meryllessig.github.io/tatakai/`, `https://meryllessig.github.io/tatakai/profile`, and other documented routes, then refresh each page (F5) and confirm that the SPA loads without GitHub 404s and displays the expected screens.

### Implementation for User Story 2

- [x] T011 [P] [US2] Configure the Vite base path in `web/vite.config.ts` by adding `base: '/tatakai/',` so the built assets are served under `/tatakai/`.
- [x] T012 [P] [US2] Update the router setup in `web/src/main.tsx` to pass `basename="/tatakai"` to `BrowserRouter` so client-side navigation uses `/tatakai/` as the base.
- [x] T013 [P] [US2] Ensure the SPA defines an in-app "Not Found" route that catches unknown paths and renders a NotFound page in `web/src/app/router/routes.tsx` (and any associated NotFound component file).
- [x] T014 [US2] Create a SPA-friendly fallback file `web/public/404.html` (based on `web/index.html`) that loads the same bundle as the main entry so GitHub Pages serves the SPA for unknown paths under `/tatakai/`.
- [x] T015 [US2] Update `specs/003-github-pages/quickstart.md` with explicit deep-link verification steps for `/tatakai/profile`, `/tatakai/settings`, and a refresh scenario on these routes.

**Checkpoint**: All documented internal routes under `/tatakai/` load correctly and survive page refresh without GitHub 404 errors.

---

## Phase 5: User Story 3 - Deployment monitoring and diagnostics (Priority: P3)

**Goal**: Developers can easily inspect deployment history and logs for each run, and confirm that failed deployments do not break the currently live site.

**Independent Test**: Trigger both a successful and a failing deployment, then confirm that both appear in the Actions history with clear logs, and that the public site continues to serve the last successful deployment when a run fails.

### Implementation for User Story 3

- [x] T016 [P] [US3] Review `.github/workflows/deploy-pages.yml` and ensure all steps have clear, descriptive names and fail loudly (no unnecessary `continue-on-error`) so issues are visible in the GitHub Actions logs.
- [x] T017 [US3] Extend `specs/003-github-pages/contracts/github-pages-deployment.md` with a "Monitoring & Logs" subsection that documents how to open the `deploy-pages` workflow runs and inspect per-step logs.
- [x] T018 [US3] Add a "Deployment" section to `web/README.md` explaining how to use the GitHub Actions UI to check deployment runs, view logs, and find the link to the GitHub Pages environment.

**Checkpoint**: Deployment history and logs are clearly documented and discoverable; failures are easy to diagnose without impacting the live site.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and cleanup work that affects multiple user stories.

- [x] T019 [P] Walk through all steps in `specs/003-github-pages/quickstart.md` end-to-end and refine wording or examples where needed in `specs/003-github-pages/quickstart.md`.
- [x] T020 [P] Perform a cleanup pass on `.github/workflows/deploy-pages.yml` (remove redundant comments, ensure consistent formatting) without changing behaviour.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – should be completed before introducing CI deployment.
- **Foundational (Phase 2)**: Depends on Setup – blocks all user story phases.
- **User Stories (Phase 3–5)**: Depend on Foundational – can be done sequentially (P1 → P2 → P3) or partially in parallel where tasks are marked [P].
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2; no dependency on other stories.
- **User Story 2 (P2)**: Can start after Phase 2; depends on User Story 1’s workflow being in place for end-to-end verification.
- **User Story 3 (P3)**: Can start after Phase 2; builds on the existence of the deployment workflow from User Story 1.

### Parallel Opportunities

- Tasks marked [P] in Phases 1–5 can be executed in parallel when working on different files.
- Different user stories (US1, US2, US3) can be tackled by different people once the Foundational phase is complete.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1 (deploy on push to `main`).
4. Validate the live deployment at `https://meryllessig.github.io/tatakai/`.

### Incremental Delivery

1. Add User Story 2: SPA base path and routing/404 behaviour.
2. Add User Story 3: Monitoring and diagnostics documentation and improvements.
3. Complete Phase N: Polish & cross-cutting documentation and cleanup.
