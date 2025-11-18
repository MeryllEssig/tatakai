# T036 – Tatakai light neobrutalist layout spec

## 1. Objective

Align Tatakai's key pages with a clear, competitive, arcade, and fun neobrutalist style, building on Retro UI and already introduced components (buttons, cards, dialog, inputs, selects).

Pages covered by T036:

- Home (tournament list + creation)
- Tournament overview
- Game history
- Leaderboard
- Matchmaking
- Help (FAQ-style visual structure, detailed content covered in US5)
- Settings

The tournament overview is the main showcase page, but all pages must remain consistent with each other.

---

## 2. Content priorities by page

### 2.1 Home

- **Priority elements**
  - "New tournament" action (main CTA).
  - List of existing tournaments.
- **Desired organization**
  - Rather spacious layout.
  - A visible action block to create a tournament.
  - A block/table listing existing tournaments.

### 2.2 Tournament overview

- **Priority elements**
  - "Go to matchmaking" action.
  - "View leaderboard" action.
  - "Create new game" action.
- **Desired organization**
  - The current tournament details block is deemed not very useful.
  - Right-side blocks should be reorganized around the key actions above.
  - Multiple blocks of equal importance rather than a single dominant large block.

### 2.3 Game history

- **Priority elements**
  - The list of games (history).
- **Desired organization**
  - Acceptable density (game table) but maintain a clear and readable structure.

### 2.4 Matchmaking

- **Priority elements**
  - "Generate suggestion" action.
  - Candidate selection.
- **Desired organization**
  - Page can be slightly denser than home.
  - The "Candidate players" section should be simplified: currently, too many mini-cards take up a lot of space for little information.
  - The rest of the page is considered generally correct for now.

### 2.5 Leaderboard

- **Priority elements**
  - Player name.
  - Rank (position in the leaderboard).
- **Desired organization**
  - Large table for the leaderboard.
  - Clear visual emphasis for the top 3 ranks: use 3 different row background colors for ranks 1, 2, and 3.

### 2.6 Help

- **Priority elements**
  - Simple understanding of principles, ranking, and matchmaking (detailed content covered in US5).
- **Desired organization (T036)**
  - Page structured as a FAQ.
  - Use Retro UI's Accordion component (`Accordion`, `AccordionItem`, etc. – see https://www.retroui.dev/docs/components/accordion).
  - A single large content area that gathers FAQ sections.

### 2.7 Settings

- **Priority elements**
  - Main settings (language, general behaviors, possibly export/reset depending on project evolution).
- **Desired organization**
  - A single large main block containing internal sections (not a collection of separate small cards).

---

## 3. Density and breathing room

- General style: **spacious**.
- Pages that can be slightly denser:
  - Matchmaking.
  - Tournament addition / game creation (wizard / forms).
- Other pages (home, overview, history, leaderboard, help, settings) should prioritize readability and breathing room.

Additional constraint:

- Global max width already set to `max-w-7xl` in the `AppShell`, we remain consistent with this constraint.

---

## 4. Neobrutalist blocks and structures

### 4.1 Lists & tables

- Preference for **large tables** on listing-type screens (especially leaderboard and history).
- Tables should leverage the neobrutalist style:
  - Well-defined borders (2px) but consistent with existing `Card` components.
  - Contrasted headers (differentiated light background, dark text).

### 4.2 Cards and sections

- Home and overview:
  - Multiple blocks of equal importance rather than a single dominant hero.
  - Typical blocks: "Actions", "Next match", "Key stats", etc. (to be specified during implementation based on available data).
- Matchmaking:
  - Reduce fragmentation into small cards for candidate players.
  - Move closer to a table structure or more compact list, while maintaining the Retro UI spirit.

### 4.3 Emphasis on top 3 in leaderboard

- Ranks 1, 2, and 3:
  - Table rows with a **specific colored background per rank**.
  - Exact colors can be derived from the global palette (e.g., variation around the accent yellow or complementary colors) but must clearly stand out.

---

## 5. Palette, accents, and graphic elements

### 5.1 Main accent

- Main accent color: **yellow `#ffdb33`**.
- Use this yellow for:
  - Main CTAs (key primary buttons).
  - Tags/badges and occasional emphasis elements.
  - Highlighting certain elements (e.g., section label, score highlight, etc.).

### 5.2 Secondary accents

- A few additional accents are allowed (e.g., to differentiate success / warning / danger), but yellow remains the dominant accent color.
- Other accents must remain compatible with the "competitive, arcade, and fun" tone (saturated greens/pinks/blues, used sparingly).

### 5.3 Colored sidebars

- Expressed preference for **colored sidebars in blocks** rather than fully colored backgrounds for all states.
- Typical application:
  - Status information, alerts, contextual help.
  - Small summary panels (e.g., tournament info, matchmaking warning, etc.).

---

## 6. Neobrutalism level

- Overall level: **medium to strong**, with the goal "a fun thing that pops".
- Implications:
  - "More visible" borders (thickness and contrast) on blocks and tables.
  - Slightly offset shadows in the Retro UI spirit (like existing buttons/cards), but without saturating screens with too many effects.
  - Rather rounded but sharp corners (radius consistent with Cards/Button).

Implementation adjustment:

- We can modulate the level of "brutality" per page: slightly more pronounced on overview / leaderboard / matchmaking (competitive pages), slightly softer on help/settings.

---

## 7. Mobile vs desktop

- **Mobile is very important**.
- Desktop: comfortable layout on `max-w-7xl`, clear block structure.
- Mobile:
  - Simplified layout (vertical stack of blocks, sufficient margins).
  - Some pages can be **more simplified** on mobile:
    - Fewer details directly visible.
    - Secondary or collapsible navigation for less critical sections.
  - Tables can be transformed or adapted (e.g., reduced columns, labels above/below, use of "row card" type blocks).

---

## 8. Overall style & tone

- Provided visual references:
  - Neobrutalist mobile interfaces with:
    - Large blocks, thick borders, and pronounced shadows.
    - Colored or textured backgrounds.
    - Very visible CTAs.
- Desired tone for Tatakai on these pages:
  - **Competitive**: highlight ranking, stats, performance.
  - **Arcade**: fun interfaces, somewhat "game-like" without being childish.
  - **Fun**: bright but controlled colors, micro-emphasis (sidebars, badges) rather than constant visual noise.

---

## 9. Implications for T036 implementation

- Build on already integrated Retro UI components (`Button`, `Card`, `Dialog`, `Input`, `Select`) and adapt them to structures per page.
- Standardize blocks by page type:
  - Home: action block + tournament list block.
  - Overview: layout with multiple blocks of equal importance (matchmaking, leaderboard, new game, etc.), tournament details block simplified or relegated.
  - History: large readable table, spacious with contrasted headers.
  - Leaderboard: large table, emphasis on top 3 (colored rows).
  - Matchmaking: slightly denser page, candidate players section simplified (fewer mini-cards, more compact structure).
  - Help: single large block containing a Retro UI Accordion for FAQ.
  - Settings: single large block with internal subsections.

This document serves as a reference for all layout and style decisions made in T036. Any conscious divergence from these rules must be documented in associated PRs or commit comments.
