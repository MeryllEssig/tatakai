# Quickstart: React SPA Deployment on GitHub Pages

This guide explains how to work with the tatakai SPA and its automatic deployment to GitHub Pages.

## 1. Local development

1. Clone the repository and check out the `003-github-pages` (or `main`) branch.
2. In a terminal, from the repository root:
   - `cd web`
   - `npm install`
3. Start the development server:
   - `npm run dev`
4. Open the local URL shown by Vite (usually `http://localhost:5173/`).

## 2. Verifying the production build locally

1. From `web/`:
   - Run `npm run build` to produce a production build in `web/dist`.
   - Optionally run `npm run preview` to serve the built app locally and check routes.
2. Verify that routes such as `/tatakai/`, `/tatakai/profile`, `/tatakai/settings` behave correctly when refreshed.

## 3. GitHub Pages deployment flow

1. Ensure GitHub Pages is configured in repository settings to use **GitHub Actions** as the source.
2. Commit and push your changes to the `main` branch.
3. GitHub Actions automatically runs the deployment workflow:
   - Installs dependencies in `web/`.
   - Runs tests (`npm run test`).
   - Builds the SPA (`npm run build`).
   - Publishes `web/dist` to GitHub Pages.
4. After the workflow completes successfully, visit:
   - `https://meryllessig.github.io/tatakai/`
   - Check direct URLs such as `/tatakai/profile` to confirm SPA routing and refresh behaviour.

## 4. Troubleshooting failed deployments

1. Go to the **Actions** tab in the `meryllessig/tatakai` repository.
2. Open the latest run of the deployment workflow triggered by your push to `main`.
3. Inspect the logs for the failing step (install, test, build, upload, deploy).
4. Fix the issue locally, re-run `npm test` and `npm run build` in `web/` until they pass.
5. Commit and push again to `main`.

The live site will always serve the last successful deployment; failed runs do not break the existing public version.
