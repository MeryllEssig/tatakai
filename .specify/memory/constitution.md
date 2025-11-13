# Tatakai Constitution

## Core Principles

### I. Universal-First React Architecture
L’application est pensée d’abord comme un projet React Native universel (mobile + web), en utilisant systématiquement des composants cross‑platform (React Native Web + Expo Universal Components).  
Chaque élément d’UI doit fonctionner sans divergence majeure entre mobile et web, avec une préférence forte pour des abstractions communes.

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
- **Persistence (AsyncStorage / file abstraction)**  
Chaque module doit être réutilisable et indépendant autant que possible.

## Développement & Workflow

### Structure du Code
- React Native + Expo
- Expo Router pour la navigation
- UI universelle compatible RN Web
- Storage Local : `AsyncStorage` (ou équivalent web via expo)

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

**Version**: 1.0.0 | **Ratified**: 2025‑11‑13 | **Last Amended**: 2025‑11‑13