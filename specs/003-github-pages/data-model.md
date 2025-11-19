# Data Model: React SPA Deployment on GitHub Pages

> This feature does not introduce new persisted domain entities (no new database tables or backend services).
> The data model below is conceptual and exists to reason about deployment behaviour and status.

## Entity: DeploymentRun

Represents a single execution of the GitHub Pages deployment pipeline.

- **id**: unique identifier of the pipeline run (GitHub run id)
- **branch**: branch name that triggered the run (expected: `main`)
- **commitSha**: SHA of the commit that triggered the run
- **status**: one of `queued`, `in_progress`, `success`, `failure`, `cancelled`
- **startedAt**: timestamp when the run started
- **finishedAt**: timestamp when the run finished
- **pagesUrl**: URL of the deployed site (`https://meryllessig.github.io/tatakai/`)
- **logsUrl**: URL to view the detailed logs for this run in the GitHub Actions UI

### Lifecycle / State Transitions

1. **queued** → **in_progress** when the workflow starts executing on a runner.
2. **in_progress** → **success** when build and publish steps complete without error.
3. **in_progress** → **failure** when any required step fails (install, build, upload, deploy).
4. Any state → **cancelled** if the run is manually stopped.

The functional spec requires that, regardless of the run’s final state, the previously successful deployment remains available until a new successful run replaces it.

## Entity: DeployedSite

Represents the current public state of the tatakai SPA on GitHub Pages.

- **url**: `https://meryllessig.github.io/tatakai/`
- **lastSuccessfulCommitSha**: commit SHA associated with the last successful deployment
- **lastSuccessfulDeployedAt**: timestamp of the last successful deployment
- **hostingEnvironment**: constant `github-pages`
- **status**: `healthy`, `degraded`, or `unknown`

### Behaviour

- When a **DeploymentRun** completes with `status = success`, the **DeployedSite** is updated to reference that commit and timestamp.
- When a **DeploymentRun** fails, **DeployedSite** remains pointing to the previous successful deployment (status may still be `healthy` if the existing site is reachable).

## Entity: SPARoute

Conceptual representation of a client-side route handled by the React Router in the SPA.

- **path**: route path, e.g. `/tatakai/`, `/tatakai/profile`, `/tatakai/settings`
- **type**: `public` (all routes for this feature are public)
- **handlerComponent**: React component responsible for rendering the route
- **existsInRouter**: boolean flag (true if statically defined in the router configuration)

### Behaviour and Constraints

- For any **SPARoute** where `existsInRouter = true`, direct navigation or browser refresh to `path` MUST load the SPA bundle and then render the `handlerComponent` without a GitHub 404.
- For paths where `existsInRouter = false` (typos, unsupported routes), the static host still serves the SPA entry file, and the SPA’s router renders the in-app "Not Found" page.

## Relationships

- A **DeployedSite** is always associated with the latest successful **DeploymentRun**.
- A **DeploymentRun** implicitly affects all **SPARoute** instances, since new code may add, remove, or change routes, but this feature does not change how routes are defined; it only guarantees their availability via static hosting.
