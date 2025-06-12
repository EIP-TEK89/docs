---
sidebar_position: 4
title: Base de Données
description: Documentation de la base de données de Trio Signo, incluant le schéma Prisma et les relations entre les modèles.
---

# Base de Données

Trio Signo utilise [PostgreSQL](https://www.postgresql.org/) comme système de gestion de base de données relationnelle et [Prisma](https://www.prisma.io/) comme ORM (Object-Relational Mapping) pour gérer les interactions avec la base de données. Cette combinaison offre une interface type-safe pour interagir avec la base de données, améliorant ainsi la sécurité et la productivité pendant le développement.

## Schéma Prisma

Le schéma Prisma définit les modèles de données et les relations entre eux. Il sert de source unique de vérité pour la structure de la base de données de l'application Trio Signo.

Voici un exemple simplifié du schéma Prisma utilisé dans l'application:

```prisma
// Schéma Prisma simplifié pour Trio Signo
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

// Autres modèles potentiels pour Trio Signo
model Dictionary {
  id          String   @id @default(uuid())
  word        String   @unique
  definition  String
  videoUrl    String
  imageUrl    String?
  category    String
  difficulty  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Principaux Modèles de Données

### Utilisateur (User)

Le modèle `User` stocke les informations des utilisateurs de l'application:

- Identifiants de connexion (email, username, password)
- Informations de profil (profilePicture)
- Données de progression (level, xp, dailyStreak)
- Horodatages (createdAt, updatedAt, lastActive)
- Relations avec d'autres modèles (progress, badges)

### Leçons (Lesson)

Le modèle `Lesson` représente les leçons disponibles dans l'application:

- Informations de base (title, description)
- Métadonnées (difficulty, category, duration)
- Relation avec les exercices (exercises)
- Horodatages (createdAt, updatedAt)

### Exercices (Exercise)

Le modèle `Exercise` définit les exercices associés aux leçons:

- Type d'exercice (type)
- Contenu de l'exercice en format JSON (content)
- Points attribués (points)
- Relation avec la leçon parente (lessonId, lesson)
- Horodatages (createdAt, updatedAt)

### Progression (Progress)

Le modèle `Progress` suit la progression de chaque utilisateur:

- Relation avec l'utilisateur (userId, user)
- Leçons complétées (lessonsCompleted)
- Exercices complétés (exercisesCompleted)
- Horodatages (createdAt, updatedAt)

### Badges (Badge)

Le modèle `Badge` représente les récompenses débloquées par les utilisateurs:

- Informations du badge (name, description, imageUrl)
- Relation avec les utilisateurs (users)
- Date de création (createdAt)

### Dictionnaire (Dictionary)

Le modèle `Dictionary` stocke les signes disponibles dans le dictionnaire:

- Mot ou signe (word)
- Définition et explication (definition)
- Médias associés (videoUrl, imageUrl)
- Catégorisation (category, difficulty)
- Horodatages (createdAt, updatedAt)

## Relations Entre les Modèles

Le schéma établit plusieurs types de relations entre les modèles:

### Relations One-to-One

- Un utilisateur a une seule progression (`User` → `Progress`)

### Relations One-to-Many

- Une leçon contient plusieurs exercices (`Lesson` → `Exercise[]`)

### Relations Many-to-Many

- Les utilisateurs peuvent avoir plusieurs badges (`User` ↔ `Badge[]`)

## Utilisation de Prisma dans l'Application

### Initialisation du Client Prisma

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

### Exemples de Requêtes Courantes

#### Récupérer un utilisateur avec sa progression

```typescript
const userWithProgress = await prisma.user.findUnique({
  where: { id: userId },
  include: { progress: true },
});
```

#### Récupérer une leçon avec ses exercices

```typescript
const lessonWithExercises = await prisma.lesson.findUnique({
  where: { id: lessonId },
  include: { exercises: true },
});
```

#### Mettre à jour la progression d'un utilisateur

```typescript
const updatedProgress = await prisma.progress.update({
  where: { userId: userId },
  data: {
    lessonsCompleted: { push: lessonId },
    exercisesCompleted: { push: exerciseId },
  },
});
```

## Migrations et Gestion du Schéma

Prisma fournit des outils pour gérer les migrations de base de données:

### Créer une migration

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Appliquer les migrations en production

```bash
npx prisma migrate deploy
```

### Générer le client Prisma

```bash
npx prisma generate
```

## Considérations de Performance

Pour garantir de bonnes performances:

1. **Indexation** des champs fréquemment utilisés dans les requêtes
2. **Sélection spécifique** des champs pour éviter de récupérer des données inutiles
3. **Pagination** pour les grandes collections de données
4. **Optimisation des requêtes** avec les outils Prisma

## Sécurité des Données

Le schéma intègre plusieurs mesures de sécurité:

- Les mots de passe sont stockés sous forme hachée (jamais en clair)
- Validation des données via les types Prisma
- Horodatages de création et modification pour l'audit
