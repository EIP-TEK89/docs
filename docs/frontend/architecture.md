---
sidebar_position: 2
---

# Architecture Frontend

## Architecture Technique

L'architecture frontend de TrioSigno est basée sur les principes de développement React modernes, en mettant l'accent sur la modularité, la réutilisabilité et la maintenabilité du code.

### Diagramme d'architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Application Frontend                    │
├───────────┬───────────────┬──────────────┬────────────────┤
│           │               │              │                │
│  Services │  Composants   │    Hooks     │     Store      │
│    API    │               │              │    (Redux)     │
│           │               │              │                │
├───────────┼───────────────┼──────────────┼────────────────┤
│           │               │              │                │
│  Clients  │   Contexte    │   Routage    │  Middlewares   │
│    HTTP   │    React      │    React     │                │
│           │               │              │                │
├───────────┴───────────────┴──────────────┴────────────────┤
│                                                           │
│                    Backend API (NestJS)                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Gestion de l'état

TrioSigno utilise Redux Toolkit pour la gestion globale de l'état. Cette approche offre plusieurs avantages :

- **Prévisibilité** : L'état de l'application suit un flux unidirectionnel
- **Débogage facile** : Les actions et les changements d'état peuvent être tracés
- **Organisation** : L'état est séparé en slices logiques
- **Performance** : Utilisation de memoization pour éviter les re-renders inutiles

### Structure du store Redux

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import lessonsReducer from "./slices/lessonsSlice";
import userProgressReducer from "./slices/userProgressSlice";
import gamificationReducer from "./slices/gamificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lessons: lessonsReducer,
    userProgress: userProgressReducer,
    gamification: gamificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Organisation des composants

Les composants sont organisés suivant la méthodologie Atomic Design :

1. **Atomes** : Composants de base (boutons, inputs, icônes)
2. **Molécules** : Groupes de composants atomiques fonctionnant ensemble
3. **Organismes** : Sections complètes de l'interface utilisateur
4. **Templates** : Structures de page sans contenu spécifique
5. **Pages** : Implémentations spécifiques des templates avec du contenu réel

### Exemple de structure de composant

```tsx
// Exemple d'un composant de carte de leçon
import React from "react";
import { useDispatch } from "react-redux";
import { Card, ProgressBar, Badge, Button } from "@components/atoms";
import { LessonIcon } from "@components/molecules";
import { startLesson } from "@redux/slices/lessonsSlice";
import { LessonType } from "@types";

interface LessonCardProps {
  lesson: LessonType;
  completed: boolean;
  progress: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  completed,
  progress,
}) => {
  const dispatch = useDispatch();

  const handleStart = () => {
    dispatch(startLesson(lesson.id));
  };

  return (
    <Card className="lesson-card">
      <LessonIcon type={lesson.type} />
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      <ProgressBar value={progress} />
      {completed && <Badge type="success">Terminé</Badge>}
      <Button onClick={handleStart}>
        {progress > 0 ? "Continuer" : "Commencer"}
      </Button>
    </Card>
  );
};
```

## Modèle de données

Les types TypeScript définissent les structures de données utilisées dans l'application :

```typescript
// Types principaux
export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  level: number;
  xp: number;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  duration: number; // en minutes
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: "video" | "quiz" | "practice";
  content: any;
  points: number;
}

export interface UserProgress {
  userId: string;
  lessonsCompleted: string[];
  exercisesCompleted: string[];
  badges: Badge[];
  dailyStreak: number;
  lastActivity: string;
}
```

## Stratégie de test

Les tests frontend sont organisés en plusieurs niveaux :

1. **Tests unitaires** : Tester les composants et hooks individuellement
2. **Tests d'intégration** : Tester les interactions entre composants
3. **Tests E2E** : Tester les flux utilisateur complets avec Playwright

### Exemple de test de composant

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@redux/store";
import { LessonCard } from "./LessonCard";

const mockLesson = {
  id: "1",
  title: "Introduction à la LSF",
  description: "Apprenez les bases de la langue des signes française",
  difficulty: "beginner",
  category: "basics",
  duration: 15,
  exercises: [],
};

describe("LessonCard Component", () => {
  test("renders lesson information correctly", () => {
    render(
      <Provider store={store}>
        <LessonCard lesson={mockLesson} completed={false} progress={0} />
      </Provider>
    );

    expect(screen.getByText(mockLesson.title)).toBeInTheDocument();
    expect(screen.getByText(mockLesson.description)).toBeInTheDocument();
    expect(screen.getByText("Commencer")).toBeInTheDocument();
  });

  test('shows "Continuer" when lesson has progress', () => {
    render(
      <Provider store={store}>
        <LessonCard lesson={mockLesson} completed={false} progress={50} />
      </Provider>
    );

    expect(screen.getByText("Continuer")).toBeInTheDocument();
  });
});
```
