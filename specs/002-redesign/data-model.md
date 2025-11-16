# Data Model – Tournament UI Redesign & i18n (002)

This feature mostly extends the existing tournament data model with routing/i18n/view-layer concepts.

## TournamentRouteContext

Represents the active tournament context as encoded in the URL.

- `tournamentId: string` – ID taken from the URL.
- `currentView: 'overview' | 'history' | 'leaderboard' | 'matchmaking' | 'settings' | 'help'` – logical sub-view.
- `isValid: boolean` – derived flag indicating whether the ID points to an existing tournament.

## LanguagePreference

Represents the effective display language and its origin.

- `code: 'fr' | 'en' | 'ja'` – language code.
- `source: 'localStorage' | 'browser' | 'fallback'` – where the language choice comes from.
- `persisted: boolean` – whether this preference is stored in localStorage.

## HelpContent

Structured content for the `/help` page.

- `sectionId: 'principles' | 'ranking' | 'matchmaking'`
- `title: string`
- `body: string` (localized, rendered in the UI)

## VisualIdentity

Represents high-level visual constraints applied across the app.

- `logoKanji: '戦'`
- `logoTitle: 'Tatakai'`
- `logoSubtitle: 'Tournament Manager'`
- `headingFont: 'Syne'`
- `bodyFont: 'Darker Grotesque'`
- `bodyFallbackFont: 'Noto Sans JP'`
- `theme: 'light-neobrutalist'`

## PlayerAvatarView

Represents the association between a player and a generated avatar.

- `playerId: string`
- `displayName: string`
- `avatarSeed: string` – derived from name or ID, deterministic.
- `variant: string` – avatar style variant based on seed.
