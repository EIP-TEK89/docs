---
sidebar_position: 1
---

# Vue d'ensemble du Frontend

## Introduction

Le frontend de TrioSigno est développé avec React et TypeScript, offrant une interface utilisateur intuitive et réactive pour l'apprentissage de la langue des signes française.

## Technologies principales

- **React**: Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **TypeScript**: Superset de JavaScript avec typage statique
- **React Router**: Pour la navigation entre les différentes pages
- **Redux Toolkit**: Pour la gestion de l'état global de l'application
- **Axios**: Pour les requêtes HTTP vers le backend
- **Styled Components**: Pour le styling des composants
- **Playwright**: Pour les tests end-to-end

## Architecture

L'architecture du frontend de TrioSigno suit les principes des bonnes pratiques React modernes, avec une séparation claire des responsabilités :

```
frontend/
├── public/          # Ressources statiques
├── src/
│   ├── api/         # Services d'API et intercepteurs
│   ├── assets/      # Images, icônes et autres ressources
│   ├── components/  # Composants React réutilisables
│   ├── context/     # Contextes React
│   ├── features/    # Fonctionnalités organisées par domaine
│   ├── hooks/       # Hooks personnalisés
│   ├── layouts/     # Layouts de l'application
│   ├── pages/       # Composants de page
│   ├── redux/       # Store, reducers et actions Redux
│   ├── types/       # Définitions de types TypeScript
│   ├── utils/       # Fonctions utilitaires
│   ├── App.tsx      # Composant racine
│   └── index.tsx    # Point d'entrée
└── tests/           # Tests d'intégration et E2E
```

## Fonctionnalités principales

### Système d'authentification

Le système d'authentification utilise JWT (JSON Web Tokens) pour sécuriser les sessions utilisateurs, avec gestion des tokens de rafraîchissement.

### Détection des gestes

Le frontend intègre la caméra web pour capturer les gestes de l'utilisateur, qui sont ensuite envoyés à l'API d'IA pour analyse.

### Système de gamification

L'interface implémente des éléments de jeu comme :

- Points d'expérience
- Niveaux
- Badges
- Défis quotidiens
- Tableaux de classement

### Mode hors ligne

L'application peut fonctionner en mode hors ligne grâce à l'utilisation de Service Workers et d'une stratégie de mise en cache.

## Communication avec le backend

La communication avec le backend se fait via des appels API REST utilisant Axios. Les requêtes sont organisées dans des services dédiés par domaine fonctionnel.

## Tests

Le frontend est testé à plusieurs niveaux :

- Tests unitaires avec Jest et React Testing Library
- Tests d'intégration pour les flux importants
- Tests end-to-end avec Playwright qui simulent les interactions utilisateur complètes

## Stratégie de déploiement

Le frontend est déployé via Docker dans un conteneur nginx optimisé pour servir des applications React statiques.
