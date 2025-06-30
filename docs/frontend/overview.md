---
sidebar_position: 1
---

# Vue d'ensemble du Frontend

## Introduction

Le frontend de TrioSigno est développé avec React et TypeScript, offrant une interface utilisateur intuitive et réactive pour l'apprentissage de la langue des signes française.

## Technologies principales

- **React 19**: Bibliothèque JavaScript pour la construction d'interfaces utilisateur
- **TypeScript 5.8**: Superset de JavaScript avec typage statique
- **React Router 7**: Pour la navigation entre les différentes pages
- **Context API**: Pour la gestion de l'état global de l'application
- **Axios**: Pour les requêtes HTTP vers le backend
- **Tailwind CSS 4**: Pour le styling des composants
- **i18next**: Pour l'internationalisation de l'application
- **Vite 6**: Pour le bundling et le développement

## Architecture

L'architecture du frontend de TrioSigno suit les principes des bonnes pratiques React modernes, avec une séparation claire des responsabilités :

```
trio-signo-front/
├── public/          # Ressources statiques
├── src/
│   ├── assets/      # Images, icônes et autres ressources
│   ├── components/  # Composants React réutilisables
│   │   ├── ui/      # Composants d'interface utilisateur génériques
│   │   ├── lessons/ # Composants spécifiques aux leçons
│   │   └── ...      # Autres composants organisés par fonctionnalité
│   ├── constants/   # Constantes et configurations
│   ├── features/    # Fonctionnalités organisées par domaine
│   ├── hooks/       # Hooks personnalisés
│   ├── i18n/        # Internationalisation
│   │   ├── locales/ # Traductions par langue
│   │   └── i18n.ts  # Configuration i18n
│   ├── pages/       # Composants de page
│   ├── services/    # Services d'API et intercepteurs
│   ├── store/       # Gestion de l'état avec Context API
│   ├── types/       # Définitions de types TypeScript
│   ├── utils/       # Fonctions utilitaires
│   ├── App.tsx      # Composant racine
│   └── main.tsx     # Point d'entrée
└── docs/            # Documentation spécifique au frontend
```

## Fonctionnalités principales

### Système d'authentification

Le système d'authentification utilise JWT (JSON Web Tokens) pour sécuriser les sessions utilisateurs, avec gestion des tokens de rafraîchissement via le Context API.

### Apprentissage des signes

L'application propose différentes leçons pour apprendre la langue des signes, avec :

- Des parcours d'apprentissage progressifs
- Un dictionnaire de signes
- Des exercices interactifs

### Internationalisation

L'application est entièrement internationalisée grâce à i18next et prend en charge :

- Français (langue par défaut)
- Anglais
- Détection automatique de la langue du navigateur
- Changement de langue via une interface utilisateur dédiée

### Profil utilisateur

Les utilisateurs peuvent :

- Consulter leur progression
- Modifier leurs informations personnelles
- Changer leurs préférences de langue
- Gérer leur mot de passe

## Communication avec le backend

La communication avec le backend se fait via des appels API REST utilisant Axios. Les requêtes sont organisées dans des services dédiés par domaine fonctionnel, avec gestion des erreurs et refresh token automatique.

## Build et déploiement

Le frontend est construit avec Vite, qui offre :

- Des temps de compilation rapides
- Un serveur de développement avec Hot Module Replacement
- Une optimisation des assets pour la production

L'application est déployée via Docker dans un conteneur nginx optimisé pour servir des applications React statiques.
