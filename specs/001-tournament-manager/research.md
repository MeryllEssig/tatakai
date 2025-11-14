# Research: 001-tournament-manager

## Overview

This document consolidates design decisions and best-practice research for the multi-game rating manager using OpenSkill.js, React + Vite + TypeScript, Jotai, Tailwind CSS, shadcn/ui, and localStorage.

The Technical Context in `plan.md` has no remaining `NEEDS CLARIFICATION` markers. This research captures the rationale behind key technology and algorithm choices and records deviations from the original spec where relevant.

---

## R-001: OpenSkill.js rating model & presets

- **Decision**
  - Use OpenSkill.js in **team-based multi-team mode** for all games, with one rating object per player.
  - Store ratings as `{ mu, sigma }` on each `Player`.
  - Expose three **per-tournament presets** (from spec clarifications):
    - **default**: `mu = 25`, `sigma = 8.333`, model close to TrueSkill/Bradley-Terry style.
    - **conservative**: `mu = 1500`, `sigma = 350` for slower rating movement.
    - **aggressive**: `mu = 1000`, `sigma = 500` for faster rating adaptation.
  - The chosen preset is stored in the tournament settings and used consistently for all games of that tournament.

- **Rationale**
  - Matches the clarified requirement that parameters are **configurable per tournament** with three preset modes.
  - Using one rating object per player keeps the model simple and makes sequential recomputation straightforward.
  - Team support in OpenSkill.js naturally handles variable team sizes and multi-team rankings (1st, 2nd, 3rd, ...).

- **Alternatives considered**
  - Single global rating configuration for all tournaments → rejected, because different groups/games can have very different volatility expectations.
  - Persisting full rating history per game instead of recomputing from history → rejected to keep persistence small and guarantee deterministic recalculation from the same game log.

---

## R-002: Sequential rating recomputation after history changes

- **Decision**
  - Ratings are **not** stored per game. Instead, ratings for all players are recomputed **sequentially** from history whenever:
    - a game is deleted,
    - or (optionally) tournament settings change in a way that affects ratings.
  - Recalculation algorithm:
    1. Reset all players to their **initial rating** defined by the tournament preset.
    2. Sort all remaining games by `createdAt` ascending.
    3. For each game, reconstruct teams and ranks, then apply OpenSkill.js to update player ratings.
    4. At the same time, recompute **bench streaks** and `gamesPlayed` from the same history.
  - Recalculation is done in-memory on the active tournament `GameData` and then persisted back to localStorage.

- **Rationale**
  - Guarantees that state is **fully determined by game history**, aligning with the constitution principle "Pas d'états cachés".
  - Matches spec: deleting a game must trigger full sequential recomputation (FR-011).
  - With constraints (≤ 50 players, ≤ 100 games), a full recomputation is cheap enough to run synchronously on the main thread.

- **Alternatives considered**
  - Incremental local adjustments after deletion (trying to only update impacted players) → rejected as error-prone and harder to reason about; full recomputation is simpler and deterministic.
  - Offloading recomputation to a Web Worker → potentially useful later if limits increase, but overkill for current constraints.

---

## R-003: Matchmaking algorithm (fairness + uncertainty + balance)

- **Decision**
  - Implement matchmaking as a **pure utility** that takes the current `GameData` snapshot and a list of candidate players, and returns recommended teams.
  - Algorithm order of priority (aligned with clarifications and FR-008/FR-009):
    1. **Bench fairness constraint**: for N players and M max players per game, no player should sit more than `ceil(N / M)` consecutive games when possible.
    2. Among eligible players, prioritize those with **highest sigma** (most uncertain rating) first.
    3. Given a candidate set, form teams that minimize **rating imbalance** based on player `mu` (or conservative `mu - 3σ` if needed).
  - Implementation approach:
    - Maintain for each player a `benchStreak` computed from history.
    - Sort candidates primarily by decreasing `benchStreak`, secondarily by decreasing `sigma`.
    - Select the top K players for the next game (K = configured max players per game).
    - Run a simple heuristic (e.g. greedy or small search) to split selected players into teams with minimal total rating variance.

- **Rationale**
  - Directly maps the clarified rule: **bench fairness first**, then uncertainty, then team balance.
  - Implemented as pure functions → easy to unit-test and reuse.

- **Alternatives considered**
  - Pure optimization/ILP solver for perfect balance → rejected as unnecessary complexity for a small offline tool.
  - Ignoring `sigma` and only balancing by `mu` → rejected because the user explicitly wants to surface and reduce rating uncertainty.

---

## R-004: Local storage layout, multi-tournament handling & Jotai integration

- **Decision**
  - Persist each tournament independently under a **per-tournament key** in `localStorage`, e.g. `"mon-tournoi-<id>"`, where `<id>` is a stable tournament id.
  - Each key stores a **`GameData` object** representing the full state of one tournament (players, games, settings, ratings).
  - The Jotai store only loads **one `GameData` at a time**:
    - Selecting a tournament in the UI triggers loading its `GameData` from `localStorage` and hydrating the root atom.
    - Switching to another tournament unloads the current `GameData` and loads the new one.
  - The tournament list screen is built by scanning known keys (or a small index) and reading lightweight metadata (id, name, counts, last game date).
  - For each tournament, maintain a **backup entry** alongside the primary key: for `"mon-tournoi-<id>"`, keep `"mon-tournoi-<id>-backup"`. On successful save, write the backup first, then the primary. On load, if the primary value is missing or corrupted (JSON parse error or invalid shape), fall back to the backup entry.

- **Rationale**
  - Keeps each tournament state **isolated** and makes backup/export operations trivial per tournament.
  - Avoids a single huge blob that mixes all tournaments and can become costly to read/write for every change.
  - Aligns with the plan.md Technical Context: key-per-tournament layout and “one tournament loaded at a time” Jotai model.
  - Satisfies FR-012 and FR-018 by defining a concrete strategy for periodic backups and automatic recovery in case of corruption.

- **Alternatives considered**
  - Single root object `StoredData` under one key `"mon-tournoi"` containing all tournaments (original spec FR-012) → rejected because:
    - leads to larger writes on every update,
    - makes per-tournament backup/export/reset less granular,
    - is harder to evolve if tournament count grows.
  - Persisting additional derived fields (leaderboards, aggregates) → rejected; they are recomputed from `GameData` in memory.

- **Spec deviation note**
  - Original spec FR-012 and the `StoredData` entity assume a single key `"mon-tournoi"` with all tournaments.
  - The implementation plan intentionally moves to **per-tournament keys + `GameData`**. The spec should be updated later to reflect this.

---

## R-005: Performance & UX boundaries

- **Decision**
  - Respect the success criteria from the spec:
    - Ratings update within **2 seconds** after recording a game (SC-002).
    - Full recomputation after deletion within **5 seconds** for ≤ 100 games (SC-004).
    - Navigation and tournament switching within **1 second** (SC-005).
  - Practical implementation choices:
    - Keep `GameData` size small (no redundant aggregates, only history + players + settings).
    - Limit heavy computations to points where the user expects them (after saving a game, after deleting a game).
    - Show a lightweight loading indicator for operations that approach the upper time bounds.

- **Rationale**
  - With spec limits (≤ 50 players, ≤ 100 games), straightforward O(G × P) algorithms are acceptable if well implemented.
  - Clear performance targets help guide future refactors (e.g. if we ever add Web Workers for recomputation).

- **Alternatives considered**
  - Precomputing and persisting multiple derived views (per-player history, leaderboards) to avoid recomputation → rejected to keep persistence simple and avoid divergence between canonical state and derived views.

---

## Status

- All major technical unknowns for this feature are resolved at the level of detail needed for implementation.
- Remaining open points are at the level of **UI/UX micro-details** (exact layouts, microcopy), which can be decided during implementation without affecting core architecture.
