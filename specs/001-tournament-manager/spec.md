# Feature Specification: Multi-Game Rating Manager with OpenSkill.js

**Feature Branch**: `001-tournament-manager`  
**Created**: 2025-11-13  
**Status**: Draft  
**Input**: User description: "Game Rating Manager multi-jeux, avec teams. Application permettant de gérer des tournois et des parties compétitives, avec des joueurs et des équipes. L'application doit me permettre de créer un tournoi, d'ajouter des joueurs, puis d'enregistrer les résultats de chaque partie. Après chaque game, un système de skill rating de type OpenSkill.js met automatiquement à jour le niveau de chaque joueur, en tenant compte des compositions d'équipes et du classement final. Je veux pouvoir visualiser le classement actuel, les statistiques des joueurs, ainsi que le niveau d'incertitude de chaque rating. L'application doit aussi proposer un matchmaking automatique capable de suggérer quels joueurs devraient participer à la prochaine partie et comment former des équipes équilibrées, en respectant à la fois l'équité du banc (personne ne doit rester trop longtemps sans jouer) et l'incertitude des ratings. Un historique complet des parties doit être disponible, avec la possibilité de supprimer une game passée : l'ensemble des ratings doit alors être recalculé séquentiellement à partir de l'historique restant. L'application doit supporter plusieurs tournois simultanément, stockés localement, afin de pouvoir naviguer facilement entre différents groupes ou types de jeux."

## Clarifications

### Session 2025-11-13

- Q: Which OpenSkill.js rating model and initial parameters should be used for player ratings? → A: Make parameters configurable per tournament with three preset modes: default (mu=25, sigma=8.333) with Bradley-Terry, conservative (mu=1500, sigma=350) for slower changes, and aggressive (mu=1000, sigma=500) for faster adjustments
- Q: What validation rules should be enforced for data integrity? → A: Enforce unique player names per tournament, valid team compositions (no empty teams), and complete rankings (no ties)
- Q: What data backup and recovery mechanisms should be implemented? → A: Automatic periodic backups with manual export option and corruption detection
- Q: How should the matchmaking algorithm prioritize between rating balance and bench fairness when they conflict? → A: Bench fairness first: for N players and M max players per game, nobody sits more than ceil(N/M) consecutive games. Once fairness constraint validated, prioritize players with highest sigma, then form balanced teams using mu ratings
- Q: How should the system handle tournament setting changes after games have been recorded? → A: Allow setting changes but preserve historical game data and apply new settings only to future games

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Game Tournament Creation and Player Management (Priority: P1)

As a tournament organizer, I want to create multi-game tournaments with flexible team configurations through a 2-step wizard so that I can manage different types of competitive events (solo, teams, various game formats).

**Why this priority**: This is the foundational functionality without which no other features can operate. Users must be able to create tournaments with different configurations and manage participants before any games can be played or ratings calculated.

**Independent Test**: Can be fully tested by creating tournaments through the wizard (basic config + player setup), adding players, and verifying the tournament structure exists with correct configurations and participants. Delivers the core value of flexible event organization.

**Acceptance Scenarios**:

1. **Given** I am on the tournament list screen, **When** I click "+ Nouveau tournoi" and complete the 2-step wizard (name, max players per game, solo/teams mode, initial players), **Then** a new tournament is created with proper default settings and appears in my tournament list
2. **Given** I am in the tournament creation wizard step 1, **When** I configure tournament settings (name, max players, solo/teams mode, OpenSkill.js toggle), **Then** my settings are preserved when I continue to step 2 for player setup
3. **Given** I have created a tournament, **When** I view it in the tournament list, **Then** I can see tournament name, player count, game count, and last game date

---

### User Story 2 - Game Recording and OpenSkill.js Rating Updates (Priority: P1)

As a tournament organizer, I want to record game results with flexible team compositions and see player ratings automatically updated so that I can track skill progression across different game formats.

**Why this priority**: This is the core competitive functionality that provides value to tournament organizers and players. Without game recording and rating updates, the system cannot fulfill its primary purpose.

**Independent Test**: Can be fully tested by recording a game result through the dedicated game result screen (team setup + ranking) and verifying that player ratings are updated according to OpenSkill.js algorithm. Delivers the essential competitive tracking value.

**Acceptance Scenarios**:

1. **Given** I have a tournament with players, **When** I record a game by setting up teams and ranking them, **Then** the game is saved and all player ratings are automatically updated based on the OpenSkill.js algorithm with proper bench streak tracking
2. **Given** I have recorded multiple games, **When** I view a player's statistics, **Then** I can see their current rating (µ, σ), uncertainty level, bench streak, games played, and rating history
3. **Given** I have games recorded, **When** I view the tournament leaderboard, **Then** players are ranked by their current OpenSkill.js ratings (µ or µ-3σ) with uncertainty indicators and game count

---

### User Story 3 - Advanced Matchmaking with Team Composition and Bench Fairness (Priority: P2)

As a tournament organizer, I want to receive automatic matchmaking suggestions with configurable parameters and bench fairness tracking so that I can create balanced games while ensuring all players get adequate playtime.

**Why this priority**: This feature significantly improves the user experience by reducing manual planning time and ensuring competitive balance with fairness considerations. It's important but secondary to basic tournament and game management.

**Independent Test**: Can be fully tested by configuring matchmaking parameters (max players, team count, bench fairness), selecting candidates, and verifying that recommended teams are balanced based on current ratings and respect bench streak rules. Delivers efficiency and game quality improvements.

**Acceptance Scenarios**:

1. **Given** I have a tournament with rated players, **When** I configure matchmaking settings (max players, team count, bench fairness) and select candidates, **Then** the system suggests balanced team compositions considering player ratings, uncertainties, and bench streaks
2. **Given** I have a tournament where some players have high bench streaks, **When** I request matchmaking with bench fairness enabled, **Then** the system prioritizes players who have been on the bench longer while maintaining team balance
3. **Given** I receive matchmaking suggestions, **When** I accept a proposal, **Then** the teams are automatically transferred to the game result screen with pre-filled team compositions for easy recording

---

### User Story 4 - Complete Game History Management with Sequential Rating Recalculation (Priority: P2)

As a tournament organizer, I want to view complete chronological game history and be able to delete games with automatic full sequential rating recalculation so that I can correct mistakes and maintain accurate tournament records.

**Why this priority**: This provides data integrity and correction capabilities. Important for maintaining trust in the rating system, but users can operate without it initially.

**Independent Test**: Can be fully tested by deleting a recorded game from the history screen and verifying that all subsequent ratings are recalculated sequentially from the remaining game history. Delivers data management and correction capabilities.

**Acceptance Scenarios**:

1. **Given** I have recorded multiple games, **When** I view the game history screen, **Then** I can see all games in chronological order with team compositions, rankings, and timestamps
2. **Given** I have a game history, **When** I delete a specific game with confirmation, **Then** all player ratings are reset to initial values and recalculated sequentially from the remaining games in chronological order
3. **Given** I delete a game, **When** I view player statistics and leaderboards, **Then** all ratings, bench streaks, and game counts reflect the recalculated values from the updated history

---

### Edge Cases

- What happens when a tournament has only enough players for one team?
- How does system handle deleted players who have game history?
- What happens when OpenSkill.js calculation encounters mathematical edge cases (zero uncertainty, extreme ratings)?
- How does system handle concurrent tournament modifications?
- What happens when game results are inconsistent (duplicate rankings, missing players)?
- How does system handle matchmaking when insufficient players are selected for configured team count?
- How does system handle tournament settings changes after games have been recorded? (RESOLVED: Changes apply only to future games, historical data preserved)
- How does system handle players with very high bench streaks when fairness constraints conflict with balance requirements? (RESOLVED: Bench fairness prioritized with max ceil(N/M) consecutive games limit)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create and manage multiple tournaments simultaneously through a centralized tournament list
- **FR-002**: System MUST provide a 2-step tournament creation wizard (basic configuration + player setup) with solo/teams mode selection
- **FR-003**: System MUST allow adding, editing, removing, and activating/deactivating players from tournaments with unique name validation per tournament
- **FR-004**: System MUST record game results with flexible team compositions, drag-and-drop ranking interface, and validation for complete rankings (no ties) and valid team compositions (no empty teams)
- **FR-005**: System MUST automatically update player ratings using OpenSkill.js algorithm after each game with configurable parameters (default, conservative, aggressive modes) and proper uncertainty tracking
- **FR-006**: System MUST display current player ratings with uncertainty levels (µ, σ) and conservative rating (µ-3σ)
- **FR-007**: System MUST provide tournament leaderboards ranked by OpenSkill.js ratings with game count and bench streak indicators
- **FR-008**: System MUST generate advanced matchmaking suggestions with configurable parameters using algorithm: bench fairness first (max ceil(N/M) consecutive games), then prioritize highest sigma players, then form balanced teams using mu ratings
- **FR-009**: System MUST track bench streak and prioritize players who haven't played recently while maintaining team balance
- **FR-010**: System MUST maintain complete chronological game history with detailed team compositions and rankings
- **FR-011**: System MUST allow deletion of games with automatic sequential rating recalculation from remaining history
- **FR-012**: System MUST store tournament data locally in browser storage (via a storage abstraction backed by `localStorage`) using a per-tournament key equal to the tournament name normalized to alphanumeric characters without spaces (e.g. `"Mon Tournoi 1!"` → `"montournoi1"`), with automatic periodic backups and corruption detection
- **FR-013**: System MUST provide comprehensive player statistics including rating history, bench streak, and performance metrics
- **FR-014**: System MUST support any team size from 1-10 players per team with flexible team composition
- **FR-015**: System MUST handle tournaments with up to 50 players per tournament
- **FR-016**: System MUST support tournament settings management (max players per game, algorithm toggles, data export/reset) with changes applying only to future games while preserving historical data
- **FR-017**: System MUST automatically open last opened tournament on app launch using lastOpenedTournamentId
- **FR-018**: System MUST provide data export functionality (JSON to clipboard), tournament reset capabilities, and automatic backup recovery options

### Key Entities *(include if feature involves data)*

- **StoredData**: Logical root view that combines tournaments metadata array and `lastOpenedTournamentId` for local storage persistence and navigation (tournaments are persisted individually under per-tournament keys)
- **Tournament**: Represents a competitive event with id, name, defaultMaxPlayersPerGame, players array, games array, and configuration settings
- **Player**: Represents a participant with id, name, OpenSkill.js rating {mu, sigma}, benchStreak, gamesPlayed, and isActive status
- **Team**: Represents a team composition with id, optional name, and array of playerIds for flexible team management
- **GameResult**: Represents a played match with id, createdAt timestamp, and teamResults array containing teamId and rank (1=winner)
- **Rating**: Represents a player's skill level using OpenSkill.js algorithm with mu (mean) and sigma (uncertainty) values
- **TeamResult**: Represents a team's performance in a specific game with teamId and rank placement

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a tournament with 10 players through the 2-step wizard in under 3 minutes
- **SC-002**: Game results are recorded through the team setup and ranking interface with ratings updated within 2 seconds of submission
- **SC-003**: Matchmaking suggestions provide balanced teams with rating variance under 10% between teams while respecting bench fairness constraints
- **SC-004**: Game deletion and full sequential rating recalculation completes within 5 seconds for tournaments with up to 100 games
- **SC-005**: Users can navigate between tournaments and access dashboard features within 1 second
- **SC-006**: 95% of matchmaking suggestions respect bench fairness rules (no player sits out more than 2 consecutive games when possible)
- **SC-007**: System maintains data integrity with 100% accuracy in OpenSkill.js rating calculations across complete tournament history
- **SC-008**: Users can successfully find and view any specific game from a 100-game history within 10 seconds
- **SC-009**: App launches and opens last used tournament within 2 seconds using local storage persistence
- **SC-010**: Tournament data export to clipboard completes within 1 second for tournaments with up to 50 players and 100 games
