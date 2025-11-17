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

- **Decision**: Implement i18n with a lightweight custom solution:
  - Typed translation dictionaries per locale (FR/EN/JA) stored as TS modules.
  - A `LanguagePreference` model persisted via the existing storage abstraction (backed by localStorage) plus browser language detection per FR-205.
  - A React context/provider exposing the effective language and a `t()` function.
  - Fallback for missing keys stays consistent with the effective language (per clarification).
- **Rationale**: Keeps dependencies minimal, matches the constitution’s simplicity principle, and is sufficient for a small SPA.
- **Alternatives considered**: `react-intl`, `react-i18next`. Rejected for now to avoid extra runtime abstraction and configuration overhead.

## Help Content Delivery

- **Decision**: Model help content (`HelpContent`) as static, localized text blocks stored in TS modules or simple markdown strings per language, rendered via React components.
- **Rationale**: No backend is required; content is small and rarely updated, and localization is already handled by the i18n layer.
- **Alternatives considered**: External CMS or remote markdown loading. Rejected due to added complexity and no current need.
