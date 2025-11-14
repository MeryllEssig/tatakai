# Contracts: 001-tournament-manager

This document defines the main **domain commands** used by the UI to manipulate tournament data. Even though the application is local-only (no backend API), these contracts act as stable boundaries between the React UI and the business logic implemented in pure utilities.

Each command should correspond to a small, testable function or service in the `lib/` layer.

---

## C-001: CreateTournament

- **Purpose**: Create a new tournament with initial settings and optional initial players.
- **Input**
  - `name: string`
  - `mode: 'solo' | 'teams'`
  - `maxPlayersPerGame: number`
  - `ratingPreset: 'default' | 'conservative' | 'aggressive'`
  - `openSkillEnabled: boolean`
  - `initialPlayers?: { name: string }[]`
- **Output**
  - `gameData: GameData` (fresh tournament state)
  - `storageKey: string` (e.g. `"mon-tournoi-<id>"`)

---

## C-002: UpdateTournamentSettings

- **Purpose**: Update mutable tournament settings without altering history.
- **Input**
  - `gameData: GameData`
  - Partial `TournamentSettings` (e.g. `benchFairnessEnabled`, `maxBenchStreak`, matchmaking defaults).
- **Output**
  - Updated `gameData` (future games use new settings, history preserved).

---

## C-003: AddOrUpdatePlayer

- **Purpose**: Add a new player or update an existing one.
- **Input**
  - `gameData: GameData`
  - `player: { id?: string; name: string; isActive?: boolean }`
- **Behaviour**
  - If `id` is absent → create a new player with initial rating and `isActive = true`.
  - If `id` exists → update existing player name and/or `isActive`.
  - Enforce **unique name per tournament** (FR-003).
- **Output**
  - Updated `gameData`.

---

## C-004: RecordGameResult

- **Purpose**: Record a new game with flexible team compositions and update ratings.
- **Input**
  - `gameData: GameData`
  - `teams: { id: string; name?: string; playerIds: string[] }[]`
  - `results: { teamId: string; rank: number }[]` (1 = winner, no ties)
  - `createdAt?: string` (ISO, default: now)
- **Validation**
  - No empty `playerIds` arrays (no empty teams).
  - All players present in `Player[]` and active.
  - Rankings are complete and have no duplicates.
- **Output**
  - Updated `gameData` with appended `GameResult`.
  - Player ratings updated via OpenSkill.js, bench streaks and `gamesPlayed` recomputed.

---

## C-005: DeleteGameAndRecompute

- **Purpose**: Delete a game from history and recompute all ratings sequentially.
- **Input**
  - `gameData: GameData`
  - `gameId: string`
- **Behaviour**
  - Remove the game with `id = gameId` from `games`.
  - Reset all players to initial rating and reset `benchStreak`, `gamesPlayed`.
  - Re-run sequential recomputation across remaining games in chronological order.
- **Output**
  - Updated `gameData` with new ratings, bench streaks, and game stats.

---

## C-006: GenerateMatchmakingSuggestion

- **Purpose**: Suggest teams for the next game respecting bench fairness and rating balance.
- **Input**
  - `gameData: GameData`
  - `candidatePlayerIds: string[]` (subset of active players)
  - Optional overrides: `maxPlayersPerGame`, `maxTeams`, `benchFairnessEnabled`.
- **Output**
  - `suggestedTeams: { id: string; playerIds: string[] }[]`
  - `benchCandidates: string[]` (players suggested to sit this game if needed)
  - Diagnostics (e.g. variance per team) for UI display.

---

## C-007: LoadTournamentFromStorage

- **Purpose**: Load a tournament `GameData` from `localStorage` into memory.
- **Input**
  - `storageKey: string` (e.g. `"mon-tournoi-<id>"`)
- **Output**
  - `gameData: GameData` (or a recoverable error if corrupted)
- **Notes**
  - Implements corruption detection and uses backups if needed.

---

## C-008: SaveTournamentToStorage

- **Purpose**: Persist the current `GameData` to `localStorage` with backup.
- **Input**
  - `storageKey: string`
  - `gameData: GameData`
- **Behaviour**
  - Serialize and write to `localStorage`.
  - Maintain a small number of backup entries for recovery.

---

These contracts should be implemented as pure or nearly-pure functions in `web/src/lib/`, with Jotai atoms in `web/src/state/` orchestrating when they are called and how their results are persisted.
