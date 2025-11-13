<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Modified principles:
  - I. Universal-First React Architecture → I. Web-First React Architecture
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
- Follow-up TODOs: none
-->

# Tatakai Constitution

## Core Principles

### I. Web-First React Architecture
L’application est pensée comme une application React web mobile-first (SPA), construite avec un outil moderne de bundling (par exemple Vite).  
L’UI doit rester responsive (mobile d’abord) et cohérente sur desktop. Les composants doivent rester découplés de toute plateforme native spécifique, et la logique métier reste agnostique du framework UI autant que possible.

### II. Simplicité avant tout
Tatakai doit rester une application simple, lisible et maintenable.  
Pas de sur‑ingénierie, pas de features grasses, pas d’architecture inutilement complexe.  
Les modules doivent rester petits, isolés, faciles à lire et faciles à tester.

### III. Business Utilities Testables
Les seules parties du code nécessitant des tests systématiques sont :
- les algorithmes métier (MMR, matchmaking, calculs séquentiels…)
- les utilitaires purs  
→ tests unitaires obligatoires et rapides.

Le reste (UI, navigation, état local, stockage) n'exige pas de couverture systématique mais doit rester simple à valider manuellement.

### IV. Architecture Modulaire
Chaque domaine doit être clairement séparé :
- **MMR / OpenSkill utilities**
- **Matchmaking**
- **Players / Teams**
- **Tournament lifecycle**
- **Persistence (localStorage / storage abstraction)**  
Chaque module doit être réutilisable et indépendant autant que possible.

## Développement & Workflow

### Structure du Code
- React (web) + Vite (SPA)
- React Router (ou équivalent) pour la navigation
- UI mobile-first responsive (par exemple Tailwind CSS + librairie de composants)
- Storage local : `localStorage` (ou équivalent persistance web) derrière une abstraction de stockage

### Workflows de Dev
- Toute nouvelle logic métier nécessite :
  1. Une function pure centralisée dans un utilitaire.
  2. Un test unitaire associé.
- Les écrans et composants peuvent être livrés sans tests si le comportement reste trivial ou purement visuel.

### Qualité
- Préférence strictement donnée aux fonctions pures pour tout ce qui touche aux calculs.
- Toute opération de recalcul global des MMR doit être entièrement déterministe et idempotente.
- Pas d'états cachés : si quelque chose peut être dérivé, il doit l’être.

### Revue & Approche
- Chaque PR doit vérifier :
  - que le code reste compréhensible,
  - que la logique métier est testée,
  - que les composants UI restent simples et universels.
- Objectif : une app lisible, maintenable, contrôlée.

## Governance
Cette constitution fait autorité sur les pratiques du projet.  
Toute modification doit inclure :
- une justification claire,
- les impacts,
- un plan de migration s'il y en a un.

**Version**: 2.0.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-14