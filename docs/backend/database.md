---
sidebar_position: 4
title: Base de Données
description: Documentation de la base de données de TrioSigno, incluant le schéma Prisma et les relations entre les modèles.
---

# Base de Données

TrioSigno utilise [Prisma](https://www.prisma.io/) comme ORM (Object-Relational Mapping) pour gérer les interactions avec la base de données. Prisma offre une interface type-safe pour interagir avec la base de données, ce qui améliore la sécurité et la productivité pendant le développement.

## Schéma Prisma

Le schéma Prisma définit les modèles de données, les relations entre eux, et sert de source unique de vérité pour la structure de la base de données.

```prisma
// Ce fichier définit le schéma de la base de données de TrioSigno

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modèle Utilisateur
model User {
  id              String           @id @default(uuid())
  email           String           @unique
  username        String           @unique
  password        String
  firstName       String?
  lastName        String?
  role            UserRole         @default(STUDENT)
  profilePicture  String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  isActive        Boolean          @default(true)
  progress        Progress[]
  sessions        LearningSession[]
  achievements    UserAchievement[]
  userPreferences UserPreference?
}

// Rôles disponibles pour les utilisateurs
enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

// Préférences utilisateur
model UserPreference {
  id             String      @id @default(uuid())
  userId         String      @unique
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  language       String      @default("fr")
  notifications  Boolean     @default(true)
  darkMode       Boolean     @default(false)
  learningGoal   Int         @default(10) // en minutes par jour
  updatedAt      DateTime    @updatedAt
}

// Modèle pour les signes à apprendre
model Sign {
  id              String          @id @default(uuid())
  name            String          @unique
  description     String
  videoUrl        String
  imageUrl        String?
  difficulty      DifficultyLevel
  category        SignCategory    @relation(fields: [categoryId], references: [id])
  categoryId      String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  lessonSigns     LessonSign[]
  progress        Progress[]
}

// Niveaux de difficulté disponibles
enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// Catégories de signes
model SignCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  description String
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  signs       Sign[]
}

// Modèle pour les leçons
model Lesson {
  id          String        @id @default(uuid())
  title       String
  description String
  order       Int
  module      Module        @relation(fields: [moduleId], references: [id])
  moduleId    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  lessonSigns LessonSign[]
  sessions    LearningSession[]
}

// Relation entre leçons et signes
model LessonSign {
  id        String    @id @default(uuid())
  lesson    Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lessonId  String
  sign      Sign      @relation(fields: [signId], references: [id], onDelete: Cascade)
  signId    String
  order     Int
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([lessonId, signId])
}

// Modèle pour les modules d'apprentissage
model Module {
  id          String    @id @default(uuid())
  title       String
  description String
  order       Int
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lessons     Lesson[]
}

// Suivi de la progression des utilisateurs
model Progress {
  id               String         @id @default(uuid())
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId           String
  sign             Sign           @relation(fields: [signId], references: [id], onDelete: Cascade)
  signId           String
  masteryLevel     Int            @default(0) // 0-100
  lastPracticed    DateTime?
  correctAttempts  Int            @default(0)
  totalAttempts    Int            @default(0)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@unique([userId, signId])
}

// Sessions d'apprentissage
model LearningSession {
  id          String    @id @default(uuid())
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  lesson      Lesson    @relation(fields: [lessonId], references: [id])
  lessonId    String
  startTime   DateTime  @default(now())
  endTime     DateTime?
  score       Int?
  xpEarned    Int?
  completed   Boolean   @default(false)
}

// Réalisations/Badges
model Achievement {
  id          String             @id @default(uuid())
  name        String             @unique
  description String
  imageUrl    String
  xpReward    Int
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  users       UserAchievement[]
}

// Relation entre utilisateurs et réalisations
model UserAchievement {
  id            String      @id @default(uuid())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  achievementId String
  achievedAt    DateTime    @default(now())

  @@unique([userId, achievementId])
}
```

## Modèles de Données

### Utilisateur (User)

Le modèle `User` stocke les informations des utilisateurs du système, avec différents rôles (étudiant, enseignant, administrateur). Chaque utilisateur peut avoir :

- Des préférences personnalisées
- Un historique de progression
- Des sessions d'apprentissage
- Des réalisations (achievements)

### Signes (Sign)

Le modèle `Sign` représente les signes de la langue des signes française (LSF) que les utilisateurs peuvent apprendre. Chaque signe appartient à une catégorie et possède un niveau de difficulté.

### Leçons et Modules

Les modèles `Lesson` et `Module` organisent le contenu d'apprentissage :

- Les modules sont des ensembles thématiques de leçons
- Les leçons contiennent plusieurs signes à apprendre
- L'association entre leçons et signes est gérée par le modèle `LessonSign`

### Progression

Le modèle `Progress` suit la progression de chaque utilisateur pour chaque signe, avec des métriques comme :

- Le niveau de maîtrise
- Le nombre de tentatives correctes et totales
- La date de dernière pratique

### Système de Gamification

Plusieurs modèles supportent le système de gamification :

- `LearningSession` pour suivre les sessions d'apprentissage
- `Achievement` pour définir les badges et récompenses
- `UserAchievement` pour attribuer des réalisations aux utilisateurs

## Relations Entre les Modèles

Le schéma Prisma définit plusieurs types de relations :

### Relations One-to-Many

- Un utilisateur peut avoir plusieurs progressions, sessions et réalisations
- Une catégorie peut contenir plusieurs signes
- Un module peut contenir plusieurs leçons

### Relations One-to-One

- Un utilisateur a un seul ensemble de préférences (`UserPreference`)

### Relations Many-to-Many

- Les signes et les leçons ont une relation many-to-many via `LessonSign`
- Les utilisateurs et les réalisations ont une relation many-to-many via `UserAchievement`

## Utilisation de Prisma dans l'Application

### Initialisation du Client Prisma

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

### Exemples de Requêtes

#### Récupération d'un utilisateur avec ses préférences

```typescript
const userWithPreferences = await prisma.user.findUnique({
  where: { id: userId },
  include: { userPreferences: true },
});
```

#### Récupération des leçons d'un module avec leurs signes

```typescript
const moduleWithLessons = await prisma.module.findUnique({
  where: { id: moduleId },
  include: {
    lessons: {
      include: {
        lessonSigns: {
          include: { sign: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    },
  },
});
```

#### Mise à jour de la progression d'un utilisateur

```typescript
const updatedProgress = await prisma.progress.upsert({
  where: {
    userId_signId: {
      userId: userId,
      signId: signId,
    },
  },
  update: {
    masteryLevel: masteryLevel,
    lastPracticed: new Date(),
    correctAttempts: { increment: isCorrect ? 1 : 0 },
    totalAttempts: { increment: 1 },
  },
  create: {
    userId: userId,
    signId: signId,
    masteryLevel: isCorrect ? 10 : 0,
    lastPracticed: new Date(),
    correctAttempts: isCorrect ? 1 : 0,
    totalAttempts: 1,
  },
});
```

## Migrations et Gestion du Schéma

Pour gérer l'évolution du schéma de la base de données, Prisma fournit des outils de migration.

### Création d'une Migration

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Application des Migrations en Production

```bash
npx prisma migrate deploy
```

### Génération du Client Prisma

Après chaque modification du schéma, il faut régénérer le client Prisma :

```bash
npx prisma generate
```

## Considérations de Performance

Pour optimiser les performances de la base de données :

1. **Indexation** : Les champs fréquemment utilisés dans les requêtes sont indexés.
2. **Sélection Précise** : Utiliser la sélection de champs pour ne récupérer que les données nécessaires.
3. **Pagination** : Implémenter la pagination pour les grandes collections de données.
4. **Mise en Cache** : Mettre en cache les résultats des requêtes fréquentes.

## Sécurité des Données

Le schéma inclut plusieurs mesures de sécurité :

- Suppression en cascade pour maintenir l'intégrité référentielle
- Validation des données via les types Prisma
- Champs pour suivre la création et la mise à jour des enregistrements
