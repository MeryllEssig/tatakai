# Tatakai – Tournament Manager

Tatakai is a local‑first tournament manager for competitive multi‑game events.  
It helps you organize tournaments with players and teams, record game results, and maintain accurate skill ratings using OpenSkill.js – all directly in the browser, with no backend.

The app is a React single‑page application (SPA) deployed on GitHub Pages.

- **Live demo**: https://meryllessig.github.io/tatakai/

---

## Overview

Tatakai is designed for small to medium tournaments where you want:

- Rich **player and team statistics** powered by a modern rating system.
- **Automatic matchmaking** that balances teams while keeping the bench fair.
- A **complete, editable game history** with sequential rating recomputation.
- A **simple, focused web app** that runs entirely in the browser and works with local storage.

Core characteristics:

- **Local‑first, single‑user**: data is stored in the browser via `localStorage`.
- **Multi‑tournament**: manage several tournaments in parallel, each with its own configuration.
- **Rating system**: OpenSkill.js with configurable presets (default / conservative / aggressive).
- **Matchmaking**: prioritizes bench fairness, then rating uncertainty, then rating balance.
- **History safety**: deleting a game triggers a full sequential rating recomputation.
- **UX**: mobile‑first, light neobrutalist design with a competitive + arcade tone.
- **Internationalization**: FR / EN / JA support with automatic language detection.

---

## Features

- **Tournament Management**

  - Create and manage multiple tournaments.
  - Solo or team‑based formats with configurable maximum players per game.
  - Per‑tournament settings (OpenSkill presets, ranking constraints, etc.).

- **Players, Ratings & Stats**

  - Add and manage players with unique names per tournament.
  - OpenSkill.js ratings (µ, σ) with conservative µ − 3σ view.
  - Track games played, rating history, and bench streaks.

- **Advanced Matchmaking**

  - Suggests who should play the next game and how to split teams.
  - **Bench fairness first**: nobody should stay on the bench too long.
  - Then prioritizes players with high rating uncertainty.
  - Finally balances teams based on current ratings.

- **Game History & Recalculation**

  - Chronological game history with compositions and rankings.
  - Deleting a past game triggers a full **sequential recomputation** of all ratings.
  - Guarantees deterministic, idempotent recomputation.

- **Local‑First Storage**

  - All data is persisted to `localStorage` behind a small storage abstraction.
  - One key per tournament, based on a normalized tournament name.
  - Supports multiple tournaments in parallel with a “last opened” shortcut.

- **Internationalization & UI**
  - Fully localized in **English**, **French**, and **Japanese**.
  - Language detection via browser preferences and a persistent language selector.
  - **Neobrutalist** visual identity using Retro UI, bold layouts, and iconography.
  - Mobile‑first, responsive layout for phones and desktops.

---

## Tech Stack

- **Language & Runtime**

  - TypeScript 5.x
  - React 19 on Vite 7 (SPA)

- **Core Libraries**

  - `react`, `react-dom`
  - `react-router-dom` 7 (routing)
  - `jotai` (state management)
  - `openskill` (rating calculations)
  - `react-i18next`, `i18next`, `i18next-browser-languagedetector` (i18n)

- **UI & Styling**

  - Tailwind CSS 4 + `tailwind-merge` + `tailwindcss-animate`
  - Retro UI components (neobrutalist design)
  - Icons: `@ant-design/icons`, `lucide-react`
  - `boring-avatars` for player avatars

- **Tooling & Quality**
  - Vite 7 (dev server, bundling)
  - TypeScript compiler (`tsc`)
  - Vitest + jsdom (unit tests for business utilities)
  - ESLint 9 (linting)

---

## Repository Structure

At a high level:

- **`web/`** – React SPA source code (tournaments, history, leaderboard, matchmaking, settings, i18n, UI).
- **`specs/`** – Design documentation and feature specs:
  - `001-tournament-manager/` – Core tournament manager & rating feature.
  - `002-redesign/` – Routing, UI redesign, visual identity, and i18n.
- **`.specify/`** – Project constitution and automation for planning/specs.
- **`.github/workflows/`** – GitHub Actions for deployment to GitHub Pages.

The main app lives in `web/`.

---

## Getting Started

### Prerequisites

- **Node.js** 24 (recommended)
- **npm** (comes with Node)

### Installation

Clone the repository and install dependencies for the web app:

```bash
git clone https://github.com/meryllessig/tatakai.git
cd tatakai/web
npm install
```

### Development Server

Start the Vite dev server:

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173/`).

### Running Tests

Business and utility logic (ratings, matchmaking, recomputation, etc.) is covered by unit tests:

```bash
npm test
```

### Linting

Run ESLint on the codebase:

```bash
npm run lint
```

### Production Build

Create an optimized production build:

```bash
npm run build
```

---

## Todo

- Improve matchmaking algorithm to better handle bench fairness and rating balance.
- Improve UX for mobile devices.
- Add support for custom matchmaking rules.
- Add support for regenerating different suggestions in the matchmaking page.
- If a player has already played with some opponents recently, prevent matchmaking from suggesting the same opponent.
- Improve ranking algorithm for fast tournaments (5-10 games per player).
- Allow changing ranking start value (and trigger a full sequential recomputation).
- Allow changing other tournament settings.
- Import/Export JSON as a file instead of a textarea / clipboard.
- Re-challenge the tournament overview page UX to make it more fun and pertinent.
- Bonus: improve fun in the UI.
