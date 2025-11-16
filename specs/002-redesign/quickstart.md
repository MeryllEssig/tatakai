# Quickstart – Tournament UI Redesign & i18n (002)

## 1. Branch & Install

1. Ensure you are on the feature branch:
   - `git checkout 002-redesign`
2. From the repo root, install web dependencies if needed:
   - `cd web`
   - `npm install`

## 2. Run the App

- Start the dev server:
  - `npm run dev`
- Open the app in the browser (default `http://localhost:5173/` with Vite).

## 3. Visual & Routing Checklist

- Verify REST-style routing:
  - `/` → home tournament list (no auto-open of last tournament).
  - `/tournament/:id` → overview page.
  - `/tournament/:id/history` → history view.
  - `/tournament/:id/leaderboard` → leaderboard view.
  - `/help` → help page.

- Verify deep-linking and invalid IDs:
  - Refresh on a sub-route preserves the same view.
  - `/tournament/unknown-id/history` shows the "Tournament not found" view with a link back to `/`.

## 4. i18n Checklist

- On first visit, language is chosen according to FR-205 (localStorage > browser > fallback).
- Changing the language via the selector updates all visible text without full reload.
- After reload, the chosen language is persisted.
- For any missing translations, UI remains consistent with the effective language (no silent switch to EN).

## 5. Visual Identity & Icons

- Header shows the 戦 logo + "Tatakai" + "Tournament Manager".
- Headings use **Syne**; body text uses **Darker Grotesque** with **Noto Sans JP** fallback.
- Layout follows a light neobrutalist style, leveraging Retro UI components.
- Main action buttons use icons from the shadcn ant-design icon set.

## 6. Tests

- Run existing tests from the `web` project:
  - `npm test`
- Add/extend vitest tests for:
  - language resolution utilities,
  - route-building helpers for deep-links.
