---
sidebar_position: 1
---

# Vue d'ensemble du Backend

## Introduction

Le backend de TrioSigno est construit avec NestJS et TypeScript, fournissant une API RESTful robuste pour gérer les données de l'application, l'authentification des utilisateurs, et la logique métier.

## Technologies principales

- **NestJS**: Framework progressif pour créer des applications serveur efficaces et évolutives
- **TypeScript**: Superset de JavaScript avec typage statique
- **Prisma**: ORM pour interagir avec la base de données PostgreSQL
- **PostgreSQL**: Système de gestion de base de données relationnelle
- **Passport.js**: Middleware d'authentification
- **Jest**: Framework de test
- **Docker**: Conteneurisation pour le déploiement

## Architecture

L'architecture backend de TrioSigno suit les principes de l'architecture hexagonale (ports et adaptateurs), avec une séparation claire des responsabilités :

```
backend/
├── src/
│   ├── config/           # Configuration de l'application
│   ├── auth/             # Module d'authentification
│   ├── users/            # Module de gestion des utilisateurs
│   ├── lessons/          # Module de gestion des leçons
│   ├── progress/         # Module de suivi de la progression
│   ├── gamification/     # Module de gamification
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

Gère l'inscription, la connexion, et la validation des utilisateurs via JWT.

### Module de gestion des utilisateurs

Responsable du CRUD des profils utilisateurs, incluant les préférences et les données personnelles.

### Module de leçons

Gère le contenu d'apprentissage, les exercices et la progression des utilisateurs.

### Module de gamification

Implémente les mécanismes de jeu comme les points, les badges, et les défis.

### Module d'IA (intégration)

Interface avec le service d'IA Python pour l'analyse des gestes en langue des signes.

## Base de données

TrioSigno utilise PostgreSQL comme système de base de données principal, avec Prisma comme ORM. Le schéma de base de données est conçu pour optimiser les performances et maintenir l'intégrité des données.

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

L'API de TrioSigno suit les principes REST, avec des endpoints organisés logiquement par domaine. Toutes les communications sont sécurisées via HTTPS et JWT pour l'authentification.

### Exemples d'endpoints

- **Authentication**

  - `POST /auth/register` - Inscription
  - `POST /auth/login` - Connexion
  - `POST /auth/refresh` - Rafraîchir le token

- **Users**

  - `GET /users/me` - Profil de l'utilisateur connecté
  - `PATCH /users/me` - Mettre à jour le profil
  - `GET /users/leaderboard` - Classement des utilisateurs

- **Lessons**

  - `GET /lessons` - Liste des leçons
  - `GET /lessons/:id` - Détails d'une leçon
  - `POST /lessons/:id/start` - Commencer une leçon
  - `POST /lessons/:id/complete` - Marquer une leçon comme terminée

- **Exercises**

  - `GET /exercises/:id` - Détails d'un exercice
  - `POST /exercises/:id/submit` - Soumettre une réponse

- **Progress**
  - `GET /progress` - Progression de l'utilisateur
  - `GET /progress/statistics` - Statistiques de l'utilisateur

## Sécurité

Le backend implémente plusieurs couches de sécurité :

- Authentification JWT avec tokens d'accès et de rafraîchissement
- Validation des données entrantes avec class-validator
- Protection contre les attaques CSRF
- Rate limiting pour prévenir les attaques par force brute
- Sanitisation des entrées utilisateur
- Gestion sécurisée des mots de passe avec bcrypt

## Tests

La stratégie de test du backend comprend :

- Tests unitaires pour les services et contrôleurs
- Tests d'intégration pour les modules
- Tests e2e pour les flux complets d'API

## Déploiement

Le backend est déployé via Docker et orchestré avec Docker Compose, permettant une mise à l'échelle horizontale facile et une intégration continue via GitHub Actions.
