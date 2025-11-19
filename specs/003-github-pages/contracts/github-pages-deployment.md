# Contract: GitHub Pages Deployment Workflow

## 1. Trigger Conditions

- **Event**: `push` event on the `main` branch of `meryllessig/tatakai`.
- **Scope**: Only commits pushed (or merged) into `main` trigger a deployment run.

## 2. Preconditions

- Repository contains the `web/` SPA project with a working `npm run build` script.
- GitHub Pages is configured to use the **GitHub Actions** deployment source (Pages environment enabled in repository settings).
- GitHub Actions is enabled for the repository, and the default `GITHUB_TOKEN` has permission to deploy to Pages.

## 3. Workflow Behaviour (Happy Path)

For each push to `main`:

1. **Checkout**
   - Use `actions/checkout` to fetch the repository contents.
2. **Node setup**
   - Use `actions/setup-node` with a Node.js LTS version compatible with the project (e.g. 20.x).
3. **Install dependencies**
   - Working directory: `web/`.
   - Install dependencies using `npm ci` (preferred) or `npm install` as a fallback.
4. **Run tests**
   - Still in `web/`.
   - Execute `npm run test` (Vitest) to validate the build before deployment.
5. **Build the SPA**
   - Execute `npm run build` in `web/` to generate a production build into `web/dist`.
6. **Publish artifact for Pages**
   - Upload `web/dist` as the Pages artifact using `actions/upload-pages-artifact`.
7. **Deploy to GitHub Pages**
   - Use `actions/deploy-pages` to deploy the uploaded artifact to the `github-pages` environment.
   - On success, the updated site is available at `https://meryllessig.github.io/tatakai/`.

## 4. Failure Modes and Guarantees

- **Build or test failure**
  - If dependency installation, tests, or build steps fail, the workflow fails with `status = failure`.
  - No new artifact is deployed; the currently live version of the site remains unchanged.
- **Pages deployment failure**
  - If artifact upload or `actions/deploy-pages` fails, the workflow is marked as failed.
  - Previously deployed site remains available.
- **Runner / infrastructure issues**
  - If GitHub-hosted runners or Pages infrastructure experience temporary issues, runs may fail or be delayed.
  - The contract remains: no partial deployment should break the existing live site.

## 5. Observability

- For each workflow run, the following must be available in the GitHub Actions UI:
  - Overall status (success, failure, cancelled).
  - Per-step logs (checkout, setup-node, install, test, build, upload, deploy).
  - Links to the deployed Pages environment (on success).
- Developers use this information to debug failed deployments and verify successful ones.

## 6. Security and Permissions

- The workflow uses the repository’s built-in `GITHUB_TOKEN` to authenticate deployment to GitHub Pages.
- No external secrets or third-party credentials are required for this feature.
- Workflow runs with the minimum permissions necessary to build and deploy the static site.
