# Data Model: 001-tournament-manager

This document describes the persistent and in-memory data structures for the multi-game rating manager with OpenSkill.js.

It is the canonical reference for the `GameData` structure stored per tournament in `localStorage`, and for the domain entities used by Jotai stores and pure business utilities.

---

## Overview

- Each **tournament** is persisted independently under a key like `"mon-tournoi-<id>"` in `localStorage`.
- The value of each key is a **`GameData`** object representing that tournament’s full state (players, games, settings, rating config).
- At runtime, the UI loads exactly **one `GameData`** into the Jotai store at a time.
- Aggregate views (leaderboards, stats, matchmaking suggestions) are **derived** from `GameData` and not persisted separately.

The original spec’s `StoredData` entity (single root object with all tournaments) is treated as a **logical view** that can be reconstructed if needed by scanning per-tournament keys and summarizing their metadata.

---

## Entity: GameData (per tournament)

Represents all persisted state for a single tournament.

| Field                    | Type                      | Description                                                     | Notes |
|--------------------------|---------------------------|-----------------------------------------------------------------|-------|
| `id`                     | `string`                  | Unique tournament id (used in storage key suffix).              | Stable across app restarts. |
| `name`                   | `string`                  | Human-readable tournament name.                                 | Shown in tournament list. |
| `createdAt`              | `string (ISO datetime)`   | Timestamp when the tournament was created.                      | |
| `updatedAt`              | `string (ISO datetime)`   | Timestamp of last structural change (players/games/settings).   | |
| `mode`                   | `'solo' | 'teams'`        | Whether games are 1v1 (solo) or multi-player teams.             | Chosen during setup. |
| `maxPlayersPerGame`      | `number`                  | Maximum number of players that can participate in a single game.| From wizard, editable in settings. |
| `ratingConfig`           | `RatingConfig`            | OpenSkill.js configuration preset for this tournament.          | See below. |
| `settings`               | `TournamentSettings`      | Additional tournament behaviour settings.                       | Matchmaking, bench fairness, etc. |
| `players`                | `Player[]`                | All players registered in this tournament.                      | See Player. |
| `games`                  | `GameResult[]`            | Chronological list of recorded games.                           | Used as canonical history. |

### RatingConfig

Represents the OpenSkill.js rating preset and tuning parameters for a tournament.

| Field          | Type                     | Description                                                  |
|----------------|--------------------------|--------------------------------------------------------------|
| `preset`       | `'default' | 'conservative' | 'aggressive'` | Named mode, as defined in the spec clarifications. |
| `mu`           | `number`                 | Initial mean for new players.                               |
| `sigma`        | `number`                 | Initial standard deviation (uncertainty) for new players.   |
| `beta?`        | `number` (optional)      | Skill variance parameter if exposed from OpenSkill.js.      |
| `tau?`         | `number` (optional)      | Dynamic factor for rating updates.                          |

### TournamentSettings

| Field                      | Type         | Description                                                      |
|----------------------------|--------------|------------------------------------------------------------------|
| `openSkillEnabled`         | `boolean`    | Whether OpenSkill.js updates are active for this tournament.    |
| `maxTeamsPerGame`          | `number`     | Max teams per game (for matchmaking and validation).           |
| `benchFairnessEnabled`     | `boolean`    | Whether bench fairness rules apply.                             |
| `maxBenchStreak`           | `number`     | Target max bench streak (e.g. `ceil(N / M)` equivalent).        |
| `matchmakingMaxPlayers`    | `number`     | Default max players for matchmaking suggestions.                |
| `matchmakingMinPlayers`    | `number`     | Minimum players for valid matchmaking suggestions.              |

---

## Entity: Player

Represents a single participant in a tournament.

| Field          | Type                    | Description                                                | Notes |
|----------------|-------------------------|------------------------------------------------------------|-------|
| `id`           | `string`                | Unique player id within this tournament.                   | Used in references. |
| `name`         | `string`                | Player display name.                                       | MUST be unique per tournament (FR-003). |
| `rating`       | `Rating`                | OpenSkill.js rating.                                       | `{ mu, sigma }`. |
| `benchStreak`  | `number`                | Number of consecutive games the player has not played.     | Derived from `games` but persisted for convenience or recomputed from history. |
| `gamesPlayed`  | `number`                | Total number of games the player has participated in.      | Derived from history. |
| `isActive`     | `boolean`               | Whether the player is eligible for matchmaking.            | Used for filtering. |

### Rating

| Field    | Type     | Description                                      |
|----------|----------|--------------------------------------------------|
| `mu`     | `number` | Player’s current mean skill estimate.           |
| `sigma`  | `number` | Uncertainty of the player’s rating.             |

A **conservative rating** can be derived as `mu - 3 * sigma` (not stored).

---

## Entity: GameResult

Represents one recorded match.

| Field          | Type                  | Description                                                   |
|----------------|-----------------------|---------------------------------------------------------------|
| `id`           | `string`              | Unique id for the game within this tournament.               |
| `createdAt`    | `string (ISO)`        | Timestamp when the game was recorded.                        |
| `teams`        | `TeamInGame[]`        | Teams that participated in this specific game.               |
| `teamResults`  | `TeamResult[]`        | Ranking of teams (1 = winner, no ties allowed).             |

### TeamInGame (local team snapshot)

| Field        | Type          | Description                                                |
|--------------|---------------|------------------------------------------------------------|
| `id`         | `string`      | Team id local to the game (not globally unique).          |
| `name?`      | `string?`     | Optional team label (e.g. "Rouge", "Bleu").             |
| `playerIds`  | `string[]`    | Player ids composing this team for this specific game.    |

### TeamResult

| Field        | Type       | Description                                        |
|--------------|------------|----------------------------------------------------|
| `teamId`     | `string`   | References a `TeamInGame.id`.                      |
| `rank`       | `number`   | 1 = best team, 2 = second, etc. No ties allowed.  |

This structure supports games with any number of teams and players per team, with validation enforcing **no empty teams** and **complete rankings**.

---

## Logical View: StoredData (spec compatibility)

The original spec defines a `StoredData` entity:

> Root storage object containing tournaments array and lastOpenedTournamentId for persistence.

Under the key-per-tournament design, `StoredData` is treated as a **logical in-memory view** that can be constructed as:

```text
StoredData = {
  tournaments: TournamentSummary[],
  lastOpenedTournamentId: string | null
}
```

Where `TournamentSummary` is:

| Field                    | Type       | Description                                           |
|--------------------------|------------|-------------------------------------------------------|
| `id`                     | `string`   | Tournament id (suffix used in `mon-tournoi-<id>`).    |
| `name`                   | `string`   | Tournament name.                                      |
| `playerCount`            | `number`   | Number of players in `GameData.players`.              |
| `gameCount`              | `number`   | Number of games in `GameData.games`.                  |
| `lastGameDate`           | `string?`  | Date of last game (or `null` if no games yet).        |

This view supports:

- The **tournament list** screen (FR-001, FR-002, FR-003).
- The **"open last tournament on launch"** behaviour (FR-017) via `lastOpenedTournamentId`.

Implementation detail: whether this is persisted under a separate index key or recomputed from per-tournament `GameData` keys is an implementation concern, but the **shape** remains as above.

---

## Non-persistent, UI-only structures

In addition to the persisted entities, the app uses transient structures for UI and algorithms:

- **LeaderboardEntry**: derived from `Player` rating and stats for display.
- **MatchmakingCandidate**: wraps a `Player` with additional selection flags.
- **MatchmakingSuggestion**: collection of teams and bench recommendations returned by the matchmaking engine.

These structures are intentionally **not persisted**; they are recomputed from `GameData` and used only in memory.
