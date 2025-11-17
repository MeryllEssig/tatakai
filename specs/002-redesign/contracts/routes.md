# Frontend Route Contracts – Tournament UI Redesign & i18n (002)

This feature defines the following user-facing routes. All routes are client-side (React Router) and have no separate backend API.

| Path                             | Description                                                  |
|----------------------------------|--------------------------------------------------------------|
| `/`                              | Home – tournament list with create/import actions.           |
| `/tournament/:id`                | Tournament overview page (entry point for a given tournament). |
| `/tournament/:id/history`        | Chronological game history for the tournament.              |
| `/tournament/:id/leaderboard`    | Leaderboard view based on OpenSkill ratings.                |
| `/tournament/:id/matchmaking`    | Matchmaking suggestions view.                               |
| `/tournament/:id/settings`       | Tournament-specific settings (including routing/i18n knobs if exposed). |
| `/new-tournament`                | Canonical new-tournament creation page|
| `/tournament/:id/new-game`       | Canonical new-game recording page for a tournament |
| `/help`                          | Help page with sections: principles, ranking, matchmaking.  |
| (error) `/tournament/unknown-id` | Renders a "Tournament not found" view with link back to `/`. |

These routes must remain stable so that URLs can be shared and refreshed without unexpected redirects.