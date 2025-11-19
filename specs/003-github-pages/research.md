# Research: React SPA Deployment on GitHub Pages

## 1. Hosting and deployment mechanism

- **Decision**: Use GitHub Pages with the official GitHub Actions Pages workflow (`actions/upload-pages-artifact` + `actions/deploy-pages`) to deploy the built SPA.
- **Rationale**:
  - Native integration with the `meryllessig/tatakai` repository.
  - No external credentials or third-party deployment services required.
  - Clear visibility in the Actions tab and first-class support for the `github-pages` environment.
  - Aligns with the project constitution (simple, GitHub-centric workflow, static hosting).
- **Alternatives considered**:
  - **Direct push to `gh-pages` branch using a third-party action** (e.g. `peaceiris/actions-gh-pages`): more moving parts, additional configuration surface, less aligned with current GitHub Pages best practices.
  - **External static hosting (Netlify, Vercel, etc.)**: would require extra accounts, potentially more configuration, and diverges from the requirement to use GitHub Pages.

## 2. Build and artifact path

- **Decision**: Build the SPA from the `web/` directory and publish the contents of `web/dist` as the Pages artifact.
- **Rationale**:
  - `web/package.json` defines the build script: `npm run build` → Vite builds into `dist/` by default.
  - Keeps build logic encapsulated in the existing Vite/TypeScript setup, with no need for custom bundling.
  - Simple CI steps: install dependencies in `web/`, run `npm run build`, then upload `web/dist`.
- **Alternatives considered**:
  - Building from repository root and wiring scripts to delegate into `web/`: adds indirection without clear benefit.
  - Custom output directory for Vite: unnecessary; default `dist/` is sufficient and conventional.

## 3. Branch and trigger strategy

- **Decision**: Trigger deployments on pushes to the `main` branch only.
- **Rationale**:
  - Matches the functional spec: “main is the single source of truth for deployments”.
  - Keeps the public site stable and tied to reviewed/merged work.
  - Reduces risk of accidentally deploying feature branches or experimental work.
- **Alternatives considered**:
  - Trigger on multiple branches (e.g. `main` + `develop`): adds complexity and would require additional environments, which are explicitly out of scope.
  - Manual-only deployments (workflow dispatched by hand): contradicts the “automatic deployment on each push to main” requirement.

## 4. SPA routing and 404 handling

- **Decision**: Configure GitHub Pages + the built SPA so that all unknown paths under `/tatakai/` resolve to the SPA entry file, and the SPA itself shows an in-app "Not Found" page for unknown routes.
- **Rationale**:
  - Prevents GitHub’s default 404 page when users refresh on internal routes or open deep links.
  - Keeps routing logic in the SPA (React Router), consistent with the project’s SPA architecture.
  - Works with static hosting: a static 404 or equivalent fallback file can mirror the SPA entry, letting the client-side router handle the final route.
- **Alternatives considered**:
  - Rely on GitHub’s default 404 handling: fails the requirement that deep links and refreshes must not show a GitHub 404.
  - Implementing server-side rewrites: not possible with GitHub Pages’ purely static hosting model.

## 5. Tooling and CI details

- **Decision**: Use Node.js LTS on the GitHub-hosted runner, with `npm ci` (or `npm install` as a fallback) in the `web/` directory, and Vitest for unit tests.
- **Rationale**:
  - Project already uses Vite + TypeScript + Vitest; the CI should mirror local workflows.
  - `npm ci` gives reproducible dependency installs using `package-lock.json`.
  - Running unit tests in CI provides a fast quality gate before publishing to Pages.
- **Alternatives considered**:
  - Skipping tests in the deployment pipeline: would speed up deployments slightly but reduce safety; tests are cheap at current project size.
  - Adding additional tools (coverage upload, linting) into the same workflow: possible future enhancement, but not required to meet the current deployment feature scope.
