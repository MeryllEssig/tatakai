 # Feature Specification: Tournament UI Redesign & i18n (002)

**Feature Branch**: `002-redesign`  
**Created**: 2025-11-16  
**Status**: Draft  
**Input**: Lot 002 – global redesign (REST-style routing, new home page, i18n FR/EN/JA, new fonts, 戦 logo, icons, avatars, light neobrutalist design).

## Clarifications

### Session 2025-11-16

- Q: Sur l’URL `/`, après cette refonte, que doit faire l’application au lancement ? → A: Toujours afficher la home `/` (liste + New + Import) sans redirection automatique, et supprimer tout usage de lastOpenedTournamentId / lastTournamentId
- Q: Quand un utilisateur arrive sur `/tournament/{id}` sans segment supplémentaire, quelle vue doit être chargée par défaut ? → A: Une vraie page d’overview dédiée pour le tournoi (résumé + navigation vers history/leaderboard/matchmaking), sans redirection implicite vers une sous-route
- Q: Pour les chaînes sans traduction disponible dans une langue donnée, quel fallback doit être appliqué ? → A: Les chaînes manquantes doivent rester cohérentes avec la langue effective déterminée par FR-205, sans fallback silencieux vers une autre langue (par exemple EN)
- Q: Que doit faire l’application lorsqu’un utilisateur ouvre une URL `/tournament/{id}/…` avec un identifiant de tournoi inexistant ? → A: Afficher une page d’erreur dédiée « Tournament not found » sur la même URL, avec une action claire pour revenir à la home `/`

---

## User Scenarios & Testing

### User Story 1 – Stay on the same view after refresh (Priority: P1)

As a user who is viewing a tournament, I want the URL to encode the tournament and the resource (history, leaderboard, matchmaking, etc.) so that I can refresh the page or share the URL and land back on exactly the same view.

**Why this priority**  
This is critical for perceived stability of the app and for link sharing.

**Independent Test**  
By implementing only the new URLs and routing, we can already test that tournament views are deep-linkable.

**Acceptance Scenarios**

1. **Given** an existing tournament with id `abc` and a non-empty history,  
   **When** I navigate to `/tournament/abc/history` and refresh the page,  
   **Then** I remain on the history view of tournament `abc` with the same data displayed.

2. **Given** a valid URL `/tournament/abc/leaderboard`,  
   **When** I paste this URL into a new browser tab,  
   **Then** the leaderboard view for tournament `abc` opens directly without going through the home page first.

3. **Given** a URL `/tournament/unknown-id/history` that does not match any existing tournament,  
   **When** I open it,  
   **Then** I see a dedicated "Tournament not found" error view on that URL, with a clear action to navigate back to the home page `/`.

---

### User Story 2 – Home focused on tournament list (Priority: P1)

As a user arriving on the home page, I want to see only my tournament list, a button to create a new tournament, and a button to import a tournament, so that the entry point of the app is simple and clear.

**Why this priority**  
This is the main entry into the application and the gateway to all other features.

**Independent Test**  
By implementing only this new home, we can test that multi-tournament management remains clear and discoverable.

**Acceptance Scenarios**

1. **Given** I visit `/`,  
   **When** the application loads,  
   **Then** I see a list of tournaments (or a message such as “No tournaments yet”), a “New tournament” button and an “Import tournament” button, and **no other sections** (stats, settings, etc.) on this page.

2. **Given** I am on `/`,  
   **When** I click an existing tournament,  
   **Then** I am redirected to the overview page `/tournament/{tournamentId}` for that tournament (which then exposes navigation to history/leaderboard/matchmaking/etc.).

3. **Given** I am on `/`,  
   **When** I create or import a tournament,  
   **Then** that tournament appears in the list and I can click it to go to its dedicated page.

---

### User Story 3 – Multilingual site with language selector (Priority: P1)

As a foreign user, I want the site to be available in French, English, and Japanese, and I want to be able to force the language via a selector (with flag emoji) that overrides the browser default language, so that I can use the app in the language I prefer.

**Why this priority**  
This has a direct impact on the international accessibility of the tool.

**Independent Test**  
By implementing only i18n + the language selector, we can test that the existing UI correctly switches languages.

**Acceptance Scenarios**

1. **Given** my browser is configured in English,  
   **When** I visit the site for the first time,  
   **Then** the interface loads in one of the supported languages based on my browser preferences (FR/EN/JA) and **all visible UI texts** are in that language.

2. **Given** I see a language selector in the header (on the right),  
   **When** I choose 🇫🇷 French,  
   **Then** all UI texts switch to French **without a full page reload**.

3. **Given** I have chosen 🇯🇵 日本語,  
   **When** I refresh the page or come back later,  
   **Then** the site still displays in Japanese because my preference has been persisted (e.g. in localStorage).

4. **Given** some strings do not (yet) have a translation,  
   **When** I use the site in a given language,  
   **Then** those strings fall back in a way that remains consistent with the effective UI language determined by FR-205 (they must not silently switch to a different language such as EN).

---

### User Story 4 – Tatakai visual identity & light neobrutalism (Priority: P2)

As a user, I want a strong visual identity with a “戦” logo, coherent typography and a neobrutalist design **across the whole site**, so that the app is recognizable and pleasant to use.

**Why this priority**  
This strengthens product perception and visual clarity but does not block core functionality.

**Independent Test**  
By applying only the new identity (logo, fonts, styles), we can test visual consistency without touching business logic.

**Acceptance Scenarios**

1. **Given** I am on any page,  
   **When** I look at the header,  
   **Then** I see on the left a logo block composed of:
   - the kanji 戦 (using the Yuji Syuku font),
   - to the right of the kanji, the text “Tatakai” (title) and “Tournament Manager” (subtitle).

2. **Given** a content page,  
   **When** I look at section headings,  
   **Then** they use the **Syne** font at weight ~750 (or the closest available weight), with a clear visual hierarchy.

3. **Given** paragraph texts and labels,  
   **When** I read them,  
   **Then** they use **Darker Grotesque** as the primary font, with **Noto Sans JP** as fallback for Japanese characters.

4. **Given** the main pages (home, tournament, history, leaderboard, matchmaking, help, settings, etc.),  
   **When** I navigate through them,  
   **Then** the design follows coherent neobrutalist principles (blocks, borders, shadows, bold colors) within a **light theme**.

---

### User Story 5 – Integrated Help page (Priority: P2)

As a user, I want a Help page that explains:
- the overall principles,
- how ranking works,
- how matchmaking works,

so that I understand what the tool does.

**Acceptance Scenarios**

1. **Given** I am on the site,  
   **When** I click a “Help” link in the navigation (header or footer),  
   **Then** I land on a `/help` page (or similar) structured into three clearly identified sections.

2. **Given** I do not know OpenSkill or the internal matchmaking logic,  
   **When** I read the “How ranking works” and “How matchmaking works” sections,  
   **Then** I understand the general logic **without technical implementation details**.

---

### User Story 6 – Iconified buttons & player avatars (Priority: P3)

As a user, I want buttons to have meaningful icons and players to have avatars generated from their names, so that I can more quickly recognize actions and people.

**Acceptance Scenarios**

1. **Given** the main buttons (create tournament, import, add player, save game, launch matchmaking, reset, etc.),  
   **When** I scan the interface,  
   **Then** each of these buttons displays an appropriate icon (ant-design/shadcn icons) next to the label.

2. **Given** a list of players (player list, leaderboard, stats, matchmaking),  
   **When** I look at each row,  
   **Then** I see a visual avatar based on the player’s name, stable from session to session.

3. **Given** two players with the same name,  
   **When** I see them in different contexts,  
   **Then** they share the same avatar (deterministic function of the name).

---

### Edge Cases

- `/tournament/{id}` URLs or sub-routes with a non-existent or deleted ID.  
- Language stored in localStorage that is no longer supported.  
- Browser language not in FR/EN/JA (fallback behavior).  
- Missing translations for some strings (fallback behavior and visibility for QA).  
- Secondary buttons (small actions in tables): icon-only vs icon + text.  
- Avatars for empty names, very long names, or non-Latin characters.  
- Accessibility: visible focus, sufficient contrast, icons with text or aria-label.

---

## Requirements

### Functional Requirements

- **FR-201 (REST-style routing & consistent URLs)**  
  The system MUST use consistent REST-style URLs for **all pages**:
  - resource-structured paths (e.g. `/tournaments`, `/tournament/{id}`, `/tournament/{id}/history`, `/help`),
  - no language parameters in the URL,
  - resources related to a tournament (history, leaderboard, stats, matchmaking, settings, etc.) MUST live under `/tournament/{id}/…`.

- **FR-202 (Simplified home)**  
  The system MUST display on `/` only:
  - the list of tournaments (optionally with sort/basic info),
  - a button to create a tournament,
  - a button to import a tournament,  
  and no other functional panels.

 - **FR-203 (Tournament-centric pages)**  
  The system MUST group the existing tournament-related features under `/tournament/{tournamentId}` and its sub-sections.  
  Everything that is **semantically** under a tournament (history, players, stats, leaderboard, matchmaking, settings, import/export, reset, etc.) MUST be accessible via a path starting with `/tournament/{tournamentId}`.

 - **FR-213 (Unknown tournament IDs)**  
  When navigating to a URL under `/tournament/{id}/…` with an ID that does not correspond to any existing tournament, the system MUST render a dedicated "Tournament not found" error view on that URL, with a clear action to navigate back to the home page `/`.

- **FR-204 (i18n support – languages)**  
  The system MUST support at least the following UI languages: French, English, and Japanese.  
  All UI strings MUST be extracted into a translation system.

- **FR-205 (Effective language strategy)**  
  The system MUST determine the effective UI language with the following priority:
  1. Language stored in localStorage when the user has explicitly changed it via the selector.
  2. Otherwise, the browser language if it matches FR/EN/JA.
  3. Otherwise, a defined fallback language (e.g. EN).  
  There MUST NOT be any language in the URL.

- **FR-206 (Language selector)**  
  The system MUST provide a language selector visible in the header, aligned to the right, which:
  - displays a flag emoji + the language name,
  - allows choosing FR/EN/JA,
  - persists the user’s choice (e.g. in localStorage) and overrides the detected language.

- **FR-207 (Help page)**  
  The system MUST expose a Help page with at least three distinct sections:
  - general principles,
  - how ranking works,
  - how matchmaking works.

- **FR-208 (Icons on buttons)**  
  The system MUST associate an appropriate icon to each main action button (create, import, save, delete, main navigation actions, etc.), using a coherent icon set (compatible with ant-design/shadcn icons).

- **FR-209 (Player avatars)**  
  The system MUST display, for each player, an avatar generated from the player’s name, in a deterministic way, reusable across lists (players, leaderboard, stats, matchmaking).

- **FR-210 (Visual identity & light neobrutalism)**  
  The system MUST apply, across **the entire site and all features**:
  - a logo based on the kanji 戦 with the Yuji Syuku font, alongside the text “Tatakai” + “Tournament Manager” on the right,
  - **Syne** font (weight ~750) for headings,
  - **Darker Grotesque** for body text, with **Noto Sans JP** as fallback for Japanese text,
  - a globally neobrutalist style within a **light theme**.

 - **FR-211 (Basic accessibility)**  
   The system SHOULD ensure:
   - sufficient contrast for texts and buttons,
   - icons accompanied by text or aria-labels,
   - a visible keyboard focus on interactive elements.

 - **FR-212 (Home behavior & removal of lastOpenedTournamentId)**  
   The system MUST always display the redesigned home `/` (tournament list + create/import) when navigating to `/`, without automatic redirection to a last-opened tournament, and MUST NOT persist or use any global "last opened tournament" state (e.g. `lastOpenedTournamentId`).

### Key Entities

- **TournamentRouteContext**  
  Represents the active tournament ID as encoded in the URL.  
  It is linked to all child views (history, leaderboard, matchmaking, settings, etc.).

- **LanguagePreference**  
  Represents the effective display language (detected or chosen).  
  Key attributes: language code (fr, en, ja), source (localStorage or browser), persisted or not.

- **HelpContent**  
  Represents the structured text of the Help page.  
  Sections: principles, ranking, matchmaking.

- **VisualIdentity**  
  Represents the high-level constraints of fonts, logo, colors, and styles (light neobrutalist design).  
  Does not store CSS implementation but functional rules (e.g. “headings use Syne, body uses Darker Grotesque; light theme”).

- **PlayerAvatarView**  
  Represents the association of a player to an avatar generated from their name.  
  Generation key: player name (or id), stable over time.

---

## Success Criteria

### Measurable Outcomes

- **SC-201 (Deep-linking)**  
  95% of direct navigation tests to URLs of the form `/tournament/{id}/…` (including refresh) end up on the expected view without unexpected redirections.

- **SC-202 (Complete i18n)**  
  For the main pages (home, tournament page, history, leaderboard, matchmaking, settings, help), 100% of visible UI strings are available in FR, EN, and JA.

- **SC-203 (Language persistence)**  
  After an explicit language choice, 100% of subsequent sessions for that user (in the same browser) reuse this language until the user changes it again.

- **SC-204 (Visual adoption)**  
  During internal reviews, 100% of reviewers confirm that the logo, fonts, and light neobrutalist style are applied consistently on the main pages.

- **SC-205 (Discoverability)**  
  From the home page, a novice user must be able, in at most 3 clicks, to reach:
  - the tournament view,
  - the history view,
  - the Help page.

- **SC-206 (Icons & avatars)**  
  On main screens, at least 90% of the major action buttons have an icon, and 100% of visible players have an avatar displayed.