---
sidebar_position: 4
title: Database
description: Documentation of TrioSigno's database, including the Prisma schema and relationships between models.
---

# Database

TrioSigno uses [Prisma](https://www.prisma.io/) as an ORM (Object-Relational Mapping) to manage database interactions. Prisma offers a type-safe interface for interacting with the database, which improves security and productivity during development.

## Prisma Schema

The Prisma schema defines the data models, relationships between them, and serves as a single source of truth for the database structure.

```prisma
// This file defines the database schema for TrioSigno

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model
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

// Available roles for users
enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

// User preferences
model UserPreference {
  id             String      @id @default(uuid())
  userId         String      @unique
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  language       String      @default("fr")
  notifications  Boolean     @default(true)
  darkMode       Boolean     @default(false)
  learningGoal   Int         @default(10) // in minutes per day
  updatedAt      DateTime    @updatedAt
}

// Model for signs to learn
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

// Available difficulty levels
enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// Sign categories
model SignCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  description String
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  signs       Sign[]
}

// Lesson model
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

// Relationship between lessons and signs
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

// Learning module model
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

// User progress tracking
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

// Learning sessions
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

// Achievements/Badges
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

// Relationship between users and achievements
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

## Data Models

### User

The `User` model stores information about system users, with different roles (student, teacher, administrator). Each user can have:

- Personalized preferences
- Progress history
- Learning sessions
- Achievements

### Sign

The `Sign` model represents the French Sign Language (LSF) signs that users can learn. Each sign belongs to a category and has a difficulty level.

### Lessons and Modules

The `Lesson` and `Module` models organize the learning content:

- Modules are thematic sets of lessons
- Lessons contain multiple signs to learn
- The association between lessons and signs is managed by the `LessonSign` model

### Progress

The `Progress` model tracks each user's progress for each sign, with metrics such as:

- Mastery level
- Number of correct and total attempts
- Date of last practice

### Gamification System

Several models support the gamification system:

- `LearningSession` to track learning sessions
- `Achievement` to define badges and rewards
- `UserAchievement` to assign achievements to users

## Relationships Between Models

The Prisma schema defines several types of relationships:

### One-to-Many Relationships

- A user can have multiple progressions, sessions, and achievements
- A category can contain multiple signs
- A module can contain multiple lessons

### One-to-One Relationships

- A user has only one set of preferences (`UserPreference`)

### Many-to-Many Relationships

- Signs and lessons have a many-to-many relationship via `LessonSign`
- Users and achievements have a many-to-many relationship via `UserAchievement`

## Using Prisma in the Application

### Initializing the Prisma Client

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

### Query Examples

#### Retrieving a User with Preferences

```typescript
const userWithPreferences = await prisma.user.findUnique({
  where: { id: userId },
  include: { userPreferences: true },
});
```

#### Retrieving a Module's Lessons with Their Signs

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

#### Updating a User's Progress

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

## Migrations and Schema Management

To manage the evolution of the database schema, Prisma provides migration tools.

### Creating a Migration

```bash
npx prisma migrate dev --name migration_name
```

### Applying Migrations in Production

```bash
npx prisma migrate deploy
```

### Generating the Prisma Client

After each schema modification, you need to regenerate the Prisma client:

```bash
npx prisma generate
```

## Performance Considerations

To optimize database performance:

1. **Indexing**: Fields frequently used in queries are indexed.
2. **Precise Selection**: Use field selection to retrieve only the necessary data.
3. **Pagination**: Implement pagination for large data collections.
4. **Caching**: Cache the results of frequent queries.

## Data Security

The schema includes several security measures:

- Cascade deletion to maintain referential integrity
- Data validation via Prisma types
- Fields to track the creation and updating of records
