# T036 – Tatakai light neobrutalist layout spec

## 1. Objectif

Aligner les pages clés de Tatakai sur un style neobrutaliste clair, compétitif, arcade et fun, en s’appuyant sur Retro UI et les composants déjà introduits (buttons, cards, dialog, inputs, selects).

Pages concernées par T036 :

- Home (liste des tournois + création)
- Tournament overview
- Game history
- Leaderboard
- Matchmaking
- Help (structure visuelle de type FAQ, contenu détaillé couvert en US5)
- Settings

L’overview de tournoi est la page vitrine principale, mais toutes les pages doivent rester cohérentes entre elles.

---

## 2. Priorités de contenu par page

### 2.1 Home

- **Éléments prioritaires**
  - Action "Nouveau tournoi" (CTA principal).
  - Liste des tournois existants.
- **Organisation souhaitée**
  - Layout plutôt aéré.
  - Un bloc d’action visible pour créer un tournoi.
  - Un bloc/table listant les tournois existants.

### 2.2 Tournament overview

- **Éléments prioritaires**
  - Action "Aller au matchmaking".
  - Action "Voir le classement".
  - Action "Créer une nouvelle partie".
- **Organisation souhaitée**
  - Le bloc de détails du tournoi actuel est jugé peu utile.
  - Les blocs de droite doivent être réorganisés autour des actions clés ci-dessus.
  - Plusieurs blocs de même importance plutôt qu’un seul gros bloc dominant.

### 2.3 Game history

- **Éléments prioritaires**
  - La liste des parties (historique).
- **Organisation souhaitée**
  - Densité acceptable (table de parties) mais garder une structure claire et lisible.

### 2.4 Matchmaking

- **Éléments prioritaires**
  - Action "Générer une suggestion".
  - Sélection des candidats.
- **Organisation souhaitée**
  - Page pouvant être un peu plus dense que la home.
  - La section "Joueurs candidats" doit être simplifiée : actuellement, trop de mini-cards prennent beaucoup de place pour peu d’information.
  - Le reste de la page est considéré comme globalement correct pour l’instant.

### 2.5 Leaderboard

- **Éléments prioritaires**
  - Nom du joueur.
  - Rank (position dans le classement).
- **Organisation souhaitée**
  - Grande table pour le leaderboard.
  - Emphase visuelle claire pour les 3 premiers rangs : utiliser 3 couleurs de fond de ligne différentes pour les rangs 1, 2 et 3.

### 2.6 Help

- **Éléments prioritaires**
  - Compréhension simple des principes, du ranking et du matchmaking (contenu détaillé en US5).
- **Organisation souhaitée (T036)**
  - Page structurée comme une FAQ.
  - Utiliser le composant Accordion de Retro UI (`Accordion`, `AccordionItem`, etc. – cf. https://www.retroui.dev/docs/components/accordion).
  - Une seule grande zone de contenu qui rassemble les sections FAQ.

### 2.7 Settings

- **Éléments prioritaires**
  - Paramètres principaux (langue, comportements généraux, éventuellement export/reset selon l’évolution du projet).
- **Organisation souhaitée**
  - Un seul grand bloc principal contenant des sections internes (et pas une collection de petites cards séparées).

---

## 3. Densité et respiration

- Style général : **aéré**.
- Pages pouvant être un peu plus denses :
  - Matchmaking.
  - Ajout de tournoi / création de game (wizard / formulaires).
- Les autres pages (home, overview, history, leaderboard, help, settings) doivent prioriser la lisibilité et la respiration.

Contrainte complémentaire :

- Largeur max globale déjà fixée à `max-w-7xl` dans l’`AppShell`, on reste cohérent avec cette contrainte.

---

## 4. Blocs neobrutalistes et structures

### 4.1 Listes & tables

- Préférence pour des **grandes tables** sur les écrans de type listing (surtout leaderboard et history).
- Les tables doivent profiter du style neobrutaliste :
  - Bordures bien marquées (2px) mais en cohérence avec les `Card` existantes.
  - En-têtes contrastés (fond clair différencié, texte foncé).

### 4.2 Cards et sections

- Home et overview :
  - Plusieurs blocs de même importance plutôt qu’un hero unique dominant.
  - Blocs typiques : "Actions", "Prochain match", "Stats clés", etc. (à préciser à l’implémentation en fonction des données disponibles).
- Matchmaking :
  - Réduire la fragmentation en petites cards pour les joueurs candidats.
  - Se rapprocher d’une structure table ou d’une liste plus compacte, tout en conservant l’esprit Retro UI.

### 4.3 Emphase sur les 3 premiers du leaderboard

- Rangs 1, 2 et 3 :
  - Lignes de table avec un **fond coloré spécifique par rang**.
  - Les couleurs exactes pourront être dérivées de la palette globale (ex. variation autour du jaune d’accent ou de couleurs complémentaires) mais doivent clairement ressortir.

---

## 5. Palette, accents et éléments graphiques

### 5.1 Accent principal

- Couleur d’accent principale : **jaune `#ffdb33`**.
- Utiliser ce jaune pour :
  - CTA principaux (boutons primaires clés).
  - Tags/badges et éléments d’emphase ponctuels.
  - Surbrillance de certains éléments (ex. label de section, highlight de score, etc.).

### 5.2 Accents secondaires

- Quelques accents supplémentaires sont autorisés (par ex. pour différencier succès / warning / danger), mais le jaune reste la couleur d’accent dominante.
- Les autres accents doivent rester compatibles avec le ton "compétitif, arcade et fun" (verts/roses/bleus saturés, utilisés avec modération).

### 5.3 Barres latérales colorées

- Préférence exprimée pour des **barres latérales colorées dans les blocs** plutôt que des backgrounds entièrement colorés pour tous les états.
- Application typique :
  - Informations de statut, alertes, aides contextuelles.
  - Petits panneaux récapitulatifs (ex. info tournoi, warning sur matchmaking, etc.).

---

## 6. Niveau de neobrutalisme

- Niveau global : **moyen à fort**, avec l’objectif "un truc fun qui pop".
- Implications :
  - Bordures "+ visibles" (épaisseur et contraste) sur blocs et tables.
  - Ombres légèrement décalées dans l’esprit Retro UI (comme les boutons/cards existants), mais sans saturer les écrans de trop d’effets.
  - Coins plutôt arrondis mais francs (rayon cohérent avec les Cards/Button).

Ajustement à l’implémentation :

- On pourra moduler le niveau de "brutalité" par page : un peu plus marqué sur overview / leaderboard / matchmaking (pages compétitives), un peu plus soft sur help/settings.

---

## 7. Mobile vs desktop

- **Mobile est très important**.
- Desktop : layout confortable sur `max-w-7xl`, structure de blocs claire.
- Mobile :
  - Layout simplifié (stack vertical des blocs, marges suffisantes).
  - Certaines pages peuvent être **plus simplifiées** en mobile :
    - Moins de détails visibles directement.
    - Navigation secondaire ou collapsible pour les sections moins critiques.
  - Les tables peuvent être transformées ou adaptées (par ex. colonnes réduites, labels au-dessus/au-dessous, utilisation de blocs type "row card").

---

## 8. Style global & tonalité

- Références visuelles fournies :
  - Interfaces mobiles neobrutalistes avec :
    - Gros blocs, bordures épaisses et ombres marquées.
    - Arrière-plans colorés ou texturés.
    - CTA très visibles.
- Tonalité souhaitée pour Tatakai sur ces pages :
  - **Compétitif** : mettre en avant le classement, les stats, les performances.
  - **Arcade** : interfaces fun, un peu "jeu" sans être infantiles.
  - **Fun** : couleurs pétantes mais maîtrisées, micro-emphases (barres latérales, badges) plutôt que bruit visuel permanent.

---

## 9. Implications pour l’implémentation T036

- S’appuyer sur les composants Retro UI déjà intégrés (`Button`, `Card`, `Dialog`, `Input`, `Select`) et les adapter aux structures par page.
- Homogénéiser les blocs par type de page :
  - Home : bloc action + bloc liste tournois.
  - Overview : layout en plusieurs blocs d’égale importance (matchmaking, leaderboard, nouvelle partie, etc.), bloc détails tournoi simplifié ou relégué.
  - History : grande table lisible, aérées avec en-têtes contrastés.
  - Leaderboard : grande table, emphasis sur top 3 (lignes colorées).
  - Matchmaking : page un peu plus dense, section joueurs candidats simplifiée (moins de mini-cards, structure plus compacte).
  - Help : grand bloc unique contenant un Accordéon Retro UI pour la FAQ.
  - Settings : grand bloc unique avec sous-sections internes.

Ce document sert de référence pour toutes les décisions de layout et de style prises dans T036. Toute divergence consciente par rapport à ces règles doit être documentée dans les PR ou commentaires de commit associés.
