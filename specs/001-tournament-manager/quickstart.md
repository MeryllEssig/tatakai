# Quickstart: 001-tournament-manager

This guide explains how to run and manually validate the multi-game rating manager feature once the `web/` app is scaffolded according to `plan.md`.

> **Note**: The exact commands may need small adjustments depending on the final tooling choices (package manager, exact React version). Treat this as a baseline.

---

## 1. Setup

1. **Create the Vite React + TS app** (if not already created):
   - From the repository root:
     - Create `web/` using a Vite React + TS template.
2. **Install dependencies** (inside `web/`):
   - React (19 or latest stable)
   - React DOM
   - React Router
   - Jotai
   - openskill
   - Tailwind CSS + autoprefixer + postcss
   - shadcn/ui (and its peer dependencies)
3. **Configure Tailwind**:
   - Set up `tailwind.config` and `postcss.config`.
   - Wire Tailwind into `src/main.tsx` via a global CSS file.
4. **Install and configure shadcn/ui**:
   - Initialize shadcn config.
   - Generate base components (Button, Card, Dialog, Input, Select, etc.).
5. **Project structure**:
   - Align `web/src` folders with `plan.md` (`features/`, `state/`, `lib/`, `ui/`, etc.).

---

## 2. Running the app

From the repository root:

1. Navigate to `web/`.
2. Install dependencies if not done: package manager install.
3. Start the dev server: dev command.
4. Open the indicated URL (usually `http://localhost:5173/`).

---

## 3. Manual validation flows

The following flows map directly to the P1/P2 user stories in the spec.

### Flow 1 – Create tournament & manage players (User Story 1)

1. Open the tournament list screen.
2. Click **"+ Nouveau tournoi"**.
3. Step 1 (wizard):
   - Enter a tournament name.
   - Choose solo/teams mode.
   - Set `maxPlayersPerGame`.
   - Choose OpenSkill preset (default/conservative/aggressive).
4. Step 2 (wizard):
   - Add several players with unique names.
5. Validate:
   - The new tournament appears in the list with correct name, player count, game count = 0, last game date empty.

### Flow 2 – Record games & verify rating updates (User Story 2)

1. Open a tournament with players.
2. Navigate to **"Nouvelle partie" / Game Result** screen.
3. Create teams and assign players (no empty teams).
4. Rank teams (1, 2, 3…) with no ties.
5. Save the game.
6. Validate:
   - Game appears in history with timestamp and team compositions.
   - Player stats screen shows updated `mu`, `sigma`, `mu-3σ`, games played, and bench streak.
   - Leaderboard ranks players by rating with uncertainty indicators.

### Flow 3 – Matchmaking suggestions (User Story 3)

1. From a tournament with multiple rated players, open the **Matchmaking** screen.
2. Configure parameters: max players, number of teams, bench fairness on.
3. Select candidate players.
4. Request a suggestion.
5. Validate:
   - Suggested teams respect bench fairness: players with high bench streaks are prioritized.
   - Among valid combinations, team rating variance is small (balanced teams).

### Flow 4 – Game history & recomputation after deletion (User Story 4)

1. Open the **Game history** screen.
2. Verify games are shown chronologically with compositions and rankings.
3. Delete a past game (with confirmation).
4. Validate:
   - Player ratings are reset and recomputed sequentially from remaining games.
   - Bench streaks and games played reflect the updated history.
   - Leaderboards and player statistics match recomputed ratings.

---

## 4. Persistence & recovery checks

1. With one or more tournaments created and games recorded, refresh the browser:
   - Validate that the last opened tournament is reopened automatically.
2. Simulate storage corruption in a dev build (e.g., manually alter an entry whose key is the normalized tournament name such as `"montournoi1"` in `localStorage`):
   - Validate that the app detects invalid data and either recovers from a backup or shows a clear error with recovery options.

These flows collectively validate the core requirements and success criteria of the feature.
