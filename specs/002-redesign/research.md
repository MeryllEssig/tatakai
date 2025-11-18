# Research – Tournament UI Redesign & i18n (002)

## Icons – shadcn ant-design

- **Decision**: Use the shadcn ant-design icon set (https://www.shadcn.io/icons/ant-design) as the unified source of icons for primary actions and navigation.
- **Rationale**: Provides a coherent iconography that integrates well with modern React/Tailwind stacks and shadcn-style components; avoids mixing multiple icon packs.
- **Alternatives considered**: Keep ad-hoc icons per screen; use a different icon set (e.g. Lucide). Rejected to keep visual identity consistent and leverage existing shadcn ecosystem.

## Neobrutalist theme – Retro UI

- **Decision**: Use Retro UI (https://www.retroui.dev/docs/install/vite) as the base neobrutalist design library, integrated into the existing Vite + Tailwind pipeline.
- **Rationale**: Retro UI provides ready-made light neobrutalist components and tokens, reducing custom CSS while matching the spec’s visual identity goals.
- **Alternatives considered**: Pure custom Tailwind theme; other design kits. Rejected to avoid re-implementing neobrutalist patterns from scratch.

## Routing & Deep-Linking

- **Decision**: Configure REST-style routes with React Router DOM 7:
  - `/` → home tournament list
  - `/tournament/:id` → overview page for the tournament
  - `/tournament/:id/history` → history view
  - `/tournament/:id/leaderboard` → leaderboard view
  - `/tournament/:id/matchmaking` → matchmaking view
  - `/tournament/:id/settings` → tournament settings
  - `/new-tournament` → canonical tournament creation page
  - `/tournament/:id/new-game` → canonical new game page for a given tournament
  - `/help` → static help page
- **Rationale**: Aligns exactly with spec FR-201/FR-203 and clarifications, keeps navigation predictable and testable.
- **Alternatives considered**: Query-parameter-based routing; hash-based routing. Rejected to preserve clean URLs and direct linkability.

## i18n Architecture

- **Decision**: Implement i18n with `react-i18next` on top of `i18next`:
  - Translation dictionaries per locale (FR/EN/JA) are defined as JSON resources under `web/src/assets/locales/{fr,en,ja}/translation.json`.
  - `web/src/i18n.ts` configures `i18next` + `react-i18next` + `i18next-browser-languagedetector` (per FR-205), handling browser language detection and fallbacks.
  - The React tree uses `useTranslation()` (and optionally a thin `useI18n()` wrapper) to access `t()` and `i18n.changeLanguage()`.
  - The existing `LanguagePreference` model and helper remain the reference for the documented resolution order (stored preference via storage abstraction > browser language > fallback) and are validated via unit tests.
  - Fallback for missing keys is delegated to `i18next` configuration and remains consistent with the effective language per spec.
- **Rationale**: Uses a well-known, battle-tested i18n stack while still keeping the app small and simple, and aligns the implementation with the updated constitution (react-i18next).
- **Alternatives considered**: A fully custom dictionary-based helper or `react-intl`. Rejected in favour of the standard `react-i18next` ecosystem and its existing language detection/plugins.

## Help Content Delivery

- **Decision**: Model help content (`HelpContent`) as static, localized text blocks stored in TS modules or simple markdown strings per language, rendered via React components.
- **Rationale**: No backend is required; content is small and rarely updated, and localization is already handled by the i18n layer.
- **Alternatives considered**: External CMS or remote markdown loading. Rejected due to added complexity and no current need.
