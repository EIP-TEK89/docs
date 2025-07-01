---
sidebar_position: 1
---

# Vue d'ensemble du mobile

## Introduction

Le mobile de TrioSigno est développé avec React et TypeScript, offrant une interface utilisateur intuitive et réactive pour l'apprentissage de la langue des signes française.

## Technologies principales

- **React Native**: Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **TypeScript**: Superset de JavaScript avec typage statique
- **Expo Router**: Pour la navigation entre les différentes pages
- **React context API**: Pour la gestion de l'état global de l'application
- **Axios**: Pour les requêtes HTTP vers le backend
- **Nativewind**: Pour le styling des composants

## Architecture

L'architecture du mobile de TrioSigno suit les principes des bonnes pratiques React modernes, avec une séparation claire des responsabilités :

```
mobile/
├── public/          # Ressources statiques
├── src/
│   ├── assets/      # Images, icônes et autres ressources
│   ├── components/  # Composants React réutilisables
│   ├── context/     # Contextes React
│   ├── app/         # Composants de page
│   ├── types/       # Définitions de types TypeScript
│   ├── services/    # Services for API calls and business logic
│   ├── App.tsx      # Composant racine
│   └── index.tsx    # Point d'entrée
└── tests/           # Tests d'intégration et E2E
```

## Fonctionnalités principales

### Système d'authentification

Le système d'authentification utilise JWT (JSON Web Tokens) pour sécuriser les sessions utilisateurs, avec gestion des tokens de rafraîchissement.

### Détection des gestes

Le mobile intègre la caméra frontale pour capturer les gestes de l'utilisateur, qui sont ensuite envoyés à l'API d'IA pour analyse.

### Système de gamification

L'interface implémente des éléments de jeu comme :

- Points d'expérience
- Niveaux
- Badges
- Défis quotidiens
- Tableaux de classement

## Communication avec le backend

La communication avec le backend se fait via des appels API REST utilisant Axios. Les requêtes sont organisées dans des services dédiés par domaine fonctionnel.

## Tests

Le mobile est testé à plusieurs niveaux :

- Tests unitaires avec Jest et React Testing Library
- Tests d'intégration pour les flux importants

## Stratégie de déploiement

Le mobile est déployé via eas optimisé pour générer fichier .apk pour des projets React Native.
