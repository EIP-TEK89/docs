---
sidebar_position: 1
---

# Vue d'ensemble du Backend

## Introduction

Le backend de Trio Signo est construit avec NestJS et TypeScript, fournissant une API RESTful robuste pour gérer les données de l'application, l'authentification des utilisateurs, et la logique métier. Cette plateforme éducative est dédiée à l'apprentissage de la langue des signes.

## Technologies principales

- **NestJS**: Framework progressif pour créer des applications serveur efficaces et évolutives
- **TypeScript**: Superset de JavaScript avec typage statique
- **Prisma**: ORM moderne pour interagir avec la base de données PostgreSQL
- **PostgreSQL**: Système de gestion de base de données relationnelle
- **JWT**: Pour l'authentification sécurisée
- **OAuth2**: Support pour l'authentification via Google ou Discord
- **Jest**: Framework de test
- **Docker**: Conteneurisation pour le déploiement

## Architecture

L'architecture backend de Trio Signo suit une structure modulaire avec une séparation claire des responsabilités :

```
backend/
├── src/
│   ├── config/           # Configuration de l'application
│   ├── auth/             # Module d'authentification
│   ├── users/            # Module de gestion des utilisateurs
│   ├── dictionary/       # Module de gestion du dictionnaire de signes
│   ├── lessons/          # Module de gestion des leçons
│   ├── exercises/        # Module de gestion des exercices
│   ├── common/           # Utilitaires, filtres, et pipes communs
│   ├── prisma/           # Client Prisma et schémas
│   ├── app.module.ts     # Module racine de l'application
│   ├── app.controller.ts # Contrôleur racine
│   ├── app.service.ts    # Service racine
│   └── main.ts           # Point d'entrée de l'application
└── test/                 # Tests d'intégration et e2e
```

## Modules principaux

### Module d'authentification

Gère l'inscription, la connexion, et la validation des utilisateurs via JWT et OAuth2 (Google).

### Module de gestion des utilisateurs

Responsable du CRUD des profils utilisateurs, incluant les préférences et les données personnelles.

### Module de dictionnaire

Gère le dictionnaire de signes et permet la recherche et la consultation des signes.

### Module de leçons

Gère le contenu d'apprentissage, organisé en leçons structurées par niveaux de difficulté.

### Module d'exercices

Responsable des différents types d'exercices interactifs pour l'apprentissage de la langue des signes.

## Base de données

Trio Signo utilise PostgreSQL comme système de base de données principal, avec Prisma comme ORM. Le schéma de base de données est conçu pour optimiser les performances et maintenir l'intégrité des données.

### Schéma Prisma simplifié

```prisma
// Modèle utilisateur
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password      String
  profilePicture String?
  level         Int       @default(1)
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  progress      Progress?
  badges        Badge[]
  dailyStreak   Int       @default(0)
  lastActive    DateTime  @default(now())
}

// Modèle de leçon
model Lesson {
  id          String     @id @default(uuid())
  title       String
  description String
  difficulty  String
  category    String
  duration    Int
  exercises   Exercise[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Modèle d'exercice
model Exercise {
  id        String   @id @default(uuid())
  type      String
  content   Json
  points    Int
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Modèle de progression
model Progress {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  lessonsCompleted  String[]
  exercisesCompleted String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Modèle de badge
model Badge {
  id          String   @id @default(uuid())
  name        String
  description String
  imageUrl    String
  users       User[]
  createdAt   DateTime @default(now())
}
```

## API RESTful

L'API de Trio Signo suit les principes REST, avec des endpoints organisés logiquement par domaine. Toutes les communications sont sécurisées via HTTPS et JWT pour l'authentification.

### Documentation de l'API

Une documentation Swagger complète est disponible à l'adresse:

```
http://triosigno.com:3000/api/docs
```

### Endpoints principaux

- **Auth**

  - `POST /auth/register` - Inscription
  - `POST /auth/login` - Connexion
  - `POST /auth/refresh` - Rafraîchir le token

- **Users**

  - `GET /users/me` - Profil de l'utilisateur connecté
  - `PATCH /users/me` - Mettre à jour le profil
  - `GET /users/leaderboard` - Classement des utilisateurs

- **Dictionary**

  - `GET /dictionary` - Recherche dans le dictionnaire de signes
  - `GET /dictionary/:id` - Détails d'un signe

- **Lessons**

  - `GET /lessons` - Liste des leçons
  - `GET /lessons/:id` - Détails d'une leçon
  - `POST /lessons/:id/start` - Commencer une leçon
  - `POST /lessons/:id/complete` - Marquer une leçon comme terminée

- **Exercises**
  - `GET /exercises/:id` - Détails d'un exercice
  - `POST /exercises/:id/submit` - Soumettre une réponse

## Démarrage rapide

Pour démarrer le serveur en mode développement:

```bash
# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env

# Exécution des migrations Prisma
npx prisma migrate dev

# Démarrage du serveur en mode développement
npm run start:dev
```

## Développement

### Commandes utiles

```bash
# Mode développement
npm run start:dev

# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de test
npm run test:cov

# Linting
npm run lint

# Formatage du code
npm run format
```

### Docker

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
npm run build
npm run start:prod
```

### CI/CD

Le projet utilise GitHub Actions pour l'intégration et le déploiement continus. Voir le dossier `.github/workflows` pour plus de détails.

## Sécurité

Le backend implémente plusieurs couches de sécurité :

- Authentification JWT avec tokens d'accès et de rafraîchissement
- Support OAuth2 pour l'authentification via Google
- Validation des données entrantes
- Gestion sécurisée des mots de passe
- Protection contre les attaques courantes
