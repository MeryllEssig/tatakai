# Feature Specification: React SPA Deployment on GitHub Pages

**Feature Branch**: `003-github-pages`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "Deployment of the tatakai React SPA on GitHub Pages (repo meryllessig/tatakai) with automatic deployment on every update of the main branch and full SPA behaviour support (client-side navigation, refresh on internal routes, /tatakai/ base path)."

## Clarifications

### Session 2025-11-19

- Q: How should the system handle direct access to unknown routes (not defined in the SPA router)? → A: Use an in-app "Not Found" page and configure static hosting to route unknown paths to the SPA entry file so users never see a raw hosting 404.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Automatic deployment on each push to the main branch (Priority: P1)

A developer works on the tatakai application. Once the changes are validated, they push a commit to the configured main branch (by default `main`). A deployment pipeline is triggered automatically, builds the application in production mode, then publishes the new version to the static hosting environment. A few minutes after the push, the up-to-date version of the application is available at the public URL.

**Why this priority**: Without reliable automatic deployment, application updates are not visible to end users. This is the core of the business value of this feature.

**Independent Test**: Push a non-trivial commit to the main branch, verify that a pipeline is triggered, that it completes successfully, and that the new version is visible at the public URL without manual intervention.

**Acceptance Scenarios**:

1. **Given** a repository correctly configured with static hosting enabled, **When** a commit is pushed to the main branch, **Then** a deployment pipeline is automatically triggered.
2. **Given** a valid commit that does not break the build, **When** the deployment pipeline completes, **Then** the new version of the application is available at the target public URL.
3. **Given** an existing deployment history, **When** a new deployment succeeds, **Then** the history shows this new deployment with a "success" status and the public URL points to this version.

---

### User Story 2 - Reliable access to the application via the public URL and internal routes (Priority: P2)

An end user accesses the application via the root public URL or a deep link (for example `/tatakai/profile` or `/tatakai/settings`). The application loads correctly, static resources (JS, CSS, images) are loaded without errors, and navigation between different pages of the application happens without a full page reload. If the user refreshes the browser on an internal route or returns later to the same URL, the application reloads correctly without a 404 page from the hosting provider.

**Why this priority**: The ability to share deep links and refresh the page without errors is essential to the user experience of a SPA.

**Independent Test**: Access several documented internal routes directly from the public URL, then refresh them (F5) and verify that no 404 error is displayed and that the expected page loads.

**Acceptance Scenarios**:

1. **Given** the application deployed at the public URL, **When** the user opens `https://meryllessig.github.io/tatakai/`, **Then** the application loads and the home page appears without resource errors.
2. **Given** the application deployed, **When** the user opens `https://meryllessig.github.io/tatakai/profile` directly, **Then** the application loads and displays the "profile" page without a hosting error page.
3. **Given** the user is on an internal route of the application, **When** they press F5 or restart the browser on the same URL, **Then** the application starts again and shows the same functional page, without a 404 error.

---

### User Story 3 - Deployment monitoring and diagnostics (Priority: P3)

A developer wants to verify that the deployment completed successfully or understand why it failed. They open the tab dedicated to deployment pipelines, see the list of recent runs with their status (success / failure), then open the detailed logs for a given run to identify any build or publish error.

**Why this priority**: Visibility into deployments allows quick diagnosis of issues and helps guarantee service continuity.

**Independent Test**: Trigger both a successful deployment and a failed deployment, then verify that both appear in the history with usable logs.

**Acceptance Scenarios**:

1. **Given** several past deployments, **When** a developer checks the list of deployments, **Then** they see the history with the status of each run.
2. **Given** a failed deployment, **When** the developer opens its logs, **Then** they can identify the step that caused the failure (for example: dependency installation, build, publish).
3. **Given** a failed deployment, **When** an end user accesses the public URL, **Then** the application remains accessible in its last functional version.

---

### Edge Cases

- A push that contains code breaking the build (compilation or test error): the pipeline fails, but the previously deployed version remains available to users without interruption.
- Incorrect configuration of the base path (`/tatakai/`) leading to broken links to static resources: resources must never be resolved outside this path.
- Direct access to an unknown route or one not defined by the client router (for example, a typo in the URL): the user sees the SPA’s in-app "Not Found" page, while the static host still serves the SPA entry file (no raw hosting 404).
- Later rename of the main branch (for example `master` → `main`): the deployment configuration should be adjustable without changing the public URL or breaking automation.
- Temporary deactivation or misconfiguration of the static hosting: the error should be detectable via deployment monitoring tools.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: On every successful push to the project’s designated main branch, a deployment pipeline MUST be triggered automatically without additional manual action.
- **FR-002**: The deployment pipeline MUST build a production version of the application from the code present on the main branch (install dependencies, build the frontend, generate static files).
- **FR-003**: The system MUST publish the build output to a static hosting environment that is publicly accessible at the URL `https://meryllessig.github.io/tatakai/`.
- **FR-004**: The frontend application MUST be configured to use `/tatakai/` as its base path so that all static resources (JS, CSS, images, fonts, etc.) are correctly loaded from this path, regardless of the internal route.
- **FR-005**: The client-side router (SPA) MUST allow navigation between the different pages of the application without a full page reload.
- **FR-006**: Direct access or a browser refresh (F5) on any documented internal route under `/tatakai/` MUST NOT produce a 404 error from the static host; the application must load and display the corresponding page.
- **FR-007**: In case of a build or deployment failure, the previously published version of the application MUST remain accessible without service interruption for the end user.
- **FR-008**: The system MUST expose a deployment history showing, at minimum for each run: the date/time, the triggering commit, the status (success/failure), and a link to detailed logs.
- **FR-009**: Only the designated main branch (by default `main`) MUST be used as the source of truth for automatic deployments to the public URL; other branches MUST NOT trigger publication to this URL.
- **FR-010**: The deployment configuration MUST be fully defined within the repository (infrastructure as code) so that recloning the repository and enabling the pipelines produces the same deployment behaviour.

### Assumptions & Dependencies

- The chosen static hosting platform allows configuring a route fallback (for example, redirecting not-found requests to a single entry file of the application) to support SPA behaviour.
- The `meryllessig/tatakai` repository is allowed to use a continuous integration service to run the deployment pipeline.
- Developers have the necessary permissions to configure publication of the application to the target public URL.

### Key Entities _(include if feature involves data)_

- **tatakai application (SPA)**: Single-page React front-end application delivered as static files (HTML, JS, CSS, assets) and accessible via `/tatakai/`.
- **Deployment pipeline**: Set of automated steps to fetch code, install dependencies, build, and publish to the static hosting environment.
- **Publishing environment**: Public static hosting space serving the generated files and exposing the URL `https://meryllessig.github.io/tatakai/`.
- **Developer**: Person who pushes code to the main branch, monitors deployments, and checks logs when issues occur.
- **End user**: Person who accesses the application via the public URL or deep links and uses the various features of the interface.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of commits pushed to the designated main branch trigger a deployment pipeline within 2 minutes of the push.
- **SC-002**: For any commit that does not break the build, the new version of the application is available at the public URL within a maximum of 10 minutes after the push.
- **SC-003**: 100% of documented internal routes (for example `/tatakai/`, `/tatakai/profile`, `/tatakai/settings`) load successfully without 404 errors, including when accessed directly or after a page refresh.
- **SC-004**: In the event of a failed deployment, the application remains accessible in its last functional version (0 service interruptions for end users caused by a failed deployment).
- **SC-005**: 100% of deployment failures are investigable: for each failure, the logs allow a developer to identify a meaningful root cause (the failing step is clearly visible).
