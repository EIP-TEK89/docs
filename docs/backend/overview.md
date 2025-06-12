---
sidebar_position: 1
---

# Vue d'ensemble du Backend

## Introduction

Le backend de Trio Signo est une API robuste construite pour l'application Trio Signo, une plateforme éducative dédiée à l'apprentissage de la langue des signes. Ce backend fournit toutes les fonctionnalités nécessaires pour gérer l'authentification des utilisateurs, le stockage des données, les leçons, les exercices et plus encore.

## Technologies principales

- **[NestJS](https://nestjs.com/)** - Framework progressif pour construire des applications serveur efficaces et évolutives
- **[Prisma](https://www.prisma.io/)** - ORM moderne pour Node.js et TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Système de gestion de base de données relationnelle
- **[TypeScript](https://www.typescriptlang.org/)** - Langage de programmation typé basé sur JavaScript
- **JWT** - Pour l'authentification sécurisée
- **OAuth2** - Support pour l'authentification via Google
- **Jest** - Framework de test
- **Docker** - Conteneurisation pour le déploiement

## Architecture

L'architecture du backend Trio Signo est organisée en modules, suivant les principes de NestJS pour une application bien structurée et maintenable:

```
trio-signo-server/
├── src/
│   ├── auth/             # Module d'authentification
│   ├── users/            # Module de gestion des utilisateurs
│   ├── dictionary/       # Module de dictionnaire de signes
│   ├── lessons/          # Module de gestion des leçons
│   ├── exercises/        # Module d'exercices d'apprentissage
│   ├── common/           # Utilitaires et services communs
│   ├── config/           # Configuration de l'application
│   ├── prisma/           # Service et schéma Prisma
│   ├── app.module.ts     # Module racine de l'application
│   ├── app.controller.ts # Contrôleur racine
│   ├── app.service.ts    # Service racine
│   └── main.ts           # Point d'entrée de l'application
├── test/                 # Tests e2e
├── prisma/               # Schémas et migrations Prisma
│   ├── schema.prisma     # Définition du schéma de données
│   └── migrations/       # Migrations de base de données
└── config/               # Fichiers de configuration
```

## Modules principaux

### Module d'authentification

Ce module gère l'inscription, la connexion et la validation des utilisateurs. Il prend en charge:

- L'authentification par identifiant/mot de passe
- L'authentification OAuth2 via Google
- La gestion des tokens JWT
- La récupération de mot de passe

### Module de gestion des utilisateurs

Ce module s'occupe de toutes les opérations relatives aux utilisateurs:

- Création et gestion des profils
- Mise à jour des informations personnelles
- Gestion des préférences
- Suivi des statistiques d'utilisation

### Module de dictionnaire

Gère la base de données de signes:

- Recherche et consultation du dictionnaire de signes
- Catégorisation des signes
- Accès aux vidéos et descriptions des signes

### Module de leçons

Responsable du contenu pédagogique:

- Organisation des leçons par thèmes et niveaux
- Suivi de la progression de l'apprentissage
- Séquençage du contenu éducatif

### Module d'exercices

Gère les différents types d'exercices proposés aux utilisateurs:

- Exercices de reconnaissance de signes
- Quizz et tests de connaissances
- Exercices pratiques avec évaluation

## Base de données

Trio Signo utilise PostgreSQL comme système de base de données principal, avec Prisma comme ORM. Le schéma de base de données est conçu pour optimiser les performances et maintenir l'intégrité des données.

## Documentation API

Une documentation Swagger complète de l'API est disponible lorsque le serveur est en cours d'exécution à l'adresse:

```
http://localhost:3000/api/docs
```

Cette documentation interactive permet de:

- Explorer tous les endpoints disponibles
- Tester les requêtes directement depuis l'interface
- Comprendre la structure des données attendues et retournées

## Endpoints principaux

- **/auth** - Authentification et gestion des utilisateurs
- **/dictionary** - Gestion du dictionnaire de signes
- **/lessons** - Accès aux leçons et contenu éducatif
- **/exercises** - Interaction avec les exercices d'apprentissage

## Démarrage rapide

Pour lancer le serveur de développement:

```bash
# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Modifiez les variables dans le fichier .env selon votre configuration

# Exécution des migrations Prisma
npx prisma migrate dev

# Démarrage du serveur en mode développement
npm run start:dev
```

## Développement

Des commandes utiles pour le développement:

```bash
# Mode développement avec rechargement à chaud
npm run start:dev

# Tests unitaires
npm run test

# Tests end-to-end
npm run test:e2e

# Couverture de test
npm run test:cov

# Linting
npm run lint

# Formatage du code
npm run format
```

## Docker

Le projet peut être exécuté dans Docker:

```bash
# Développement
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up
```

## Déploiement

### Production

Pour déployer en production:

```bash
# Construction pour la production
npm run build

# Démarrage en mode production
npm run start:prod
```

### CI/CD

Le projet utilise GitHub Actions pour l'intégration et le déploiement continus. Voir le dossier `.github/workflows` pour plus de détails.

## Sécurité

Le backend implémente plusieurs couches de sécurité:

- Authentification JWT avec tokens d'accès et de rafraîchissement
- Support OAuth2 pour l'authentification via Google
- Validation des données entrantes
- Gestion sécurisée des mots de passe
- Protection contre les attaques courantes
