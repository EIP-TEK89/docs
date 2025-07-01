---
sidebar_position: 1
title: Directives de Code
description: Guide des standards et bonnes pratiques de code pour contribuer au projet TrioSigno.
---

# Directives de Code

Ce document définit les standards et les bonnes pratiques à suivre lors du développement et de la contribution au projet TrioSigno.

## Principes Généraux

Nous suivons ces principes fondamentaux :

1. **Lisibilité** - Le code doit être facile à lire et à comprendre
2. **Maintenabilité** - Le code doit être facile à maintenir et à faire évoluer
3. **Testabilité** - Le code doit être facile à tester
4. **Performance** - Le code doit être efficace et optimisé
5. **Sécurité** - Le code doit respecter les bonnes pratiques de sécurité

## Structure du Projet

Le projet est structuré selon une architecture modulaire :

```
triosigno/
├── client/               # Frontend React/Next.js
│   ├── components/       # Composants UI réutilisables
│   ├── hooks/            # Hooks React personnalisés
│   ├── pages/            # Pages de l'application
│   ├── public/           # Fichiers statiques
│   ├── styles/           # Styles globaux et thèmes
│   └── utils/            # Utilitaires frontend
│
├── mobile/               # Mobile React/Next.js
│   ├── components/       # Composants UI réutilisables
│   ├── app/              # Pages de l'application
│   ├── services/         # Services for API calls and business logic
│   ├── constants/        # Constant values used in the application
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Styles globaux et thèmes
│   └── utils/            # Utilitaires mobile
│
├── server/               # Backend Node.js/Express
│   ├── api/              # Routes et contrôleurs API
│   ├── config/           # Configuration du serveur
│   ├── middleware/       # Middleware Express
│   ├── models/           # Modèles de données
│   ├── services/         # Services métier
│   └── utils/            # Utilitaires backend
│
├── shared/               # Code partagé frontend/backend
│   ├── constants/        # Constantes partagées
│   ├── types/            # Types TypeScript partagés
│   └── validation/       # Schémas de validation
│
├── ia/                   # Composants d'intelligence artificielle
│   ├── models/           # Modèles d'IA entraînés
│   ├── training/         # Scripts d'entraînement
│   └── utils/            # Utilitaires pour l'IA
│
├── prisma/               # Schéma et migrations Prisma
│
├── tests/                # Tests globaux
│   ├── e2e/              # Tests end-to-end
│   └── integration/      # Tests d'intégration
│
└── scripts/              # Scripts utilitaires
```

## Standards de Code

### TypeScript

Nous utilisons TypeScript pour bénéficier du typage statique :

```typescript
// Préférer les interfaces pour les structures de données
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Utiliser des types pour les unions et les types utilitaires
type UserRole = "admin" | "teacher" | "student";
type UserWithoutId = Omit<User, "id">;

// Éviter any, préférer unknown si nécessaire
function processData(data: unknown): void {
  if (isUser(data)) {
    // Le type est maintenant User
    console.log(data.username);
  }
}

// Fonction de garde de type
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "username" in obj &&
    "email" in obj
  );
}
```

### Nommage

Nous suivons ces conventions de nommage :

- **PascalCase** pour les classes, interfaces, types et composants React
- **camelCase** pour les variables, fonctions et propriétés
- **UPPER_CASE** pour les constantes
- **kebab-case** pour les fichiers CSS et les URLs

```typescript
// Constantes
const MAX_RETRY_ATTEMPTS = 3;

// Variables
const userProfile = getUserProfile();

// Fonctions
function calculateProgress(userId: string): number {
  // ...
}

// Classes
class AuthenticationService {
  // ...
}

// Interfaces
interface SignProperties {
  // ...
}

// Composants React
function UserProfileCard({ user }: UserProfileCardProps) {
  // ...
}
```

### Formatage

Nous utilisons ESLint et Prettier pour assurer la cohérence du code. Les fichiers de configuration sont inclus dans le projet.

Configuration ESLint :

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ]
  }
}
```

Configuration Prettier :

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Commentaires

Nous suivons ces pratiques pour les commentaires :

- Commentaires JSDoc pour les fonctions et classes publiques
- Commentaires simples pour expliquer la logique complexe
- Éviter les commentaires qui répètent simplement le code

```typescript
/**
 * Calcule le niveau de maîtrise d'un signe pour un utilisateur.
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param signId - L'identifiant du signe
 * @returns Le niveau de maîtrise entre 0 et 100
 */
async function calculateMasteryLevel(
  userId: string,
  signId: string
): Promise<number> {
  // Récupérer l'historique des tentatives
  const attempts = await getAttemptHistory(userId, signId);

  // Utiliser une moyenne pondérée des 10 dernières tentatives
  // où les tentatives récentes ont plus de poids
  const recentAttempts = attempts.slice(-10);

  // ...calcul complexe...

  return masteryLevel;
}
```

## Frontend

### Composants React

Nous utilisons des composants fonctionnels avec des hooks :

```tsx
import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  onStart: () => void;
}

export function LessonCard({
  lessonId,
  title,
  description,
  onStart,
}: LessonCardProps) {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Charger la progression de l'utilisateur pour cette leçon
    async function loadProgress() {
      if (user) {
        const userProgress = await fetchLessonProgress(user.id, lessonId);
        setProgress(userProgress);
      }
    }

    loadProgress();
  }, [user, lessonId]);

  return (
    <div className="lesson-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <Button onClick={onStart}>Commencer</Button>
    </div>
  );
}
```

### Gestion d'État

Nous utilisons une combinaison de hooks React (useState, useReducer) et de React Context pour la gestion d'état :

```tsx
// Contexte pour la gestion de l'authentification
import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" };

const AuthContext = createContext<
  | {
      state: AuthState;
      dispatch: React.Dispatch<AuthAction>;
    }
  | undefined
>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### Styles

Nous utilisons une combinaison de CSS Modules et de Tailwind CSS :

```tsx
// Exemple avec CSS Modules
import styles from "./Button.module.css";

export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

// Exemple avec Tailwind CSS
export function Card({ title, children }) {
  return (
    <div className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
```

## Backend

### Architecture

Nous suivons une architecture en couches :

1. **Routes** - Définissent les endpoints API
2. **Contrôleurs** - Gèrent les requêtes et les réponses
3. **Services** - Contiennent la logique métier
4. **Modèles** - Définissent la structure des données

```typescript
// Route
import express from "express";
import { getLessons, getLessonById } from "../controllers/lessonController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/lessons", authenticate, getLessons);
router.get("/lessons/:id", authenticate, getLessonById);

export default router;

// Contrôleur
import { Request, Response } from "express";
import { LessonService } from "../services/lessonService";

const lessonService = new LessonService();

export async function getLessons(req: Request, res: Response) {
  try {
    const lessons = await lessonService.getAllLessons();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
}

// Service
import { prisma } from "../config/database";

export class LessonService {
  async getAllLessons() {
    return prisma.lesson.findMany({
      orderBy: { order: "asc" },
      include: {
        module: true,
      },
    });
  }
}
```

### Gestion des Erreurs

Nous utilisons un middleware de gestion d'erreurs centralisé :

```typescript
import { Request, Response, NextFunction } from "express";

// Types d'erreurs personnalisés
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// Middleware de gestion d'erreurs
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
```

### Validation

Nous utilisons Zod pour la validation des données :

```typescript
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schéma de validation pour la création d'un utilisateur
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Middleware de validation
export function validateCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    createUserSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.errors,
      });
    }
    next(error);
  }
}
```

## Tests

### Tests Unitaires

Nous utilisons Jest pour les tests unitaires :

```typescript
import { calculateMasteryLevel } from "./masteryCalculator";
import { getAttemptHistory } from "./attemptService";

// Mock des dépendances
jest.mock("./attemptService", () => ({
  getAttemptHistory: jest.fn(),
}));

describe("calculateMasteryLevel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 0 for no attempts", async () => {
    (getAttemptHistory as jest.Mock).mockResolvedValue([]);

    const result = await calculateMasteryLevel("user1", "sign1");

    expect(result).toBe(0);
    expect(getAttemptHistory).toHaveBeenCalledWith("user1", "sign1");
  });

  test("should calculate mastery based on recent attempts", async () => {
    // Configure le mock pour retourner des données de test
    (getAttemptHistory as jest.Mock).mockResolvedValue([
      { correct: true, date: new Date("2023-01-01") },
      { correct: false, date: new Date("2023-01-02") },
      { correct: true, date: new Date("2023-01-03") },
    ]);

    const result = await calculateMasteryLevel("user1", "sign1");

    // Vérifie que le résultat correspond à ce que nous attendons
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

### Tests d'Intégration

Nous utilisons Supertest pour tester les API :

```typescript
import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/database";
import { createUser, generateAuthToken } from "../utils/testHelpers";

describe("Lesson API", () => {
  let authToken: string;

  beforeAll(async () => {
    // Créer un utilisateur de test et générer un token
    const user = await createUser({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    authToken = generateAuthToken(user);
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test("GET /api/lessons should return all lessons", async () => {
    const response = await request(app)
      .get("/api/lessons")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("GET /api/lessons/:id should return a specific lesson", async () => {
    // Créer une leçon de test
    const lesson = await prisma.lesson.create({
      data: {
        title: "Test Lesson",
        description: "Test description",
        order: 1,
        module: {
          create: {
            title: "Test Module",
            description: "Test module description",
            order: 1,
          },
        },
      },
    });

    const response = await request(app)
      .get(`/api/lessons/${lesson.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(lesson.id);
    expect(response.body.title).toBe("Test Lesson");
  });
});
```

### Tests End-to-End

Nous utilisons Playwright pour les tests end-to-end :

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Authentication Flow", () => {
  test("should allow user to sign up, log in, and access protected content", async ({
    page,
  }) => {
    // 1. Navigate to the signup page
    await page.goto("/signup");

    // 2. Fill out and submit the signup form
    await page.fill('input[name="username"]', `testuser-${Date.now()}`);
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");
    await page.click('button[type="submit"]');

    // 3. Verify redirect to login page or dashboard
    await expect(page).toHaveURL(/login|dashboard/);

    // 4. If redirected to login, complete login
    if (page.url().includes("login")) {
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', "Password123!");
      await page.click('button[type="submit"]');
    }

    // 5. Verify access to dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");

    // 6. Navigate to lessons page
    await page.click("text=Lessons");

    // 7. Verify access to lessons
    await expect(page).toHaveURL(/lessons/);
    await expect(page.locator("h1")).toContainText("Lessons");
  });
});
```

## Sécurité

### Authentification

Nous utilisons JWT (JSON Web Tokens) pour l'authentification :

```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { UnauthorizedError } from "../utils/errors";

export class AuthService {
  async login(email: string, password: string) {
    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
```

### Validation des Entrées

Nous validons toutes les entrées utilisateur :

```typescript
import { z } from "zod";

// Schéma de validation pour les paramètres de requête
const lessonQuerySchema = z.object({
  moduleId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
});

// Validation et extraction des paramètres
export function validateLessonQuery(query: any) {
  return lessonQuerySchema.parse(query);
}
```

### Protection contre les Attaques Courantes

Nous mettons en place des protections contre les attaques courantes :

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

export function configureSecurityMiddleware(app) {
  // Protection des en-têtes HTTP
  app.use(helmet());

  // Limitation de débit pour éviter les attaques par force brute
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requêtes par IP
      message: "Too many login attempts, please try again later",
    })
  );

  // Protection contre les attaques XSS
  app.use(xss());

  // Protection contre la pollution des paramètres HTTP
  app.use(hpp());
}
```

## Processus de Développement

### Flux de Travail Git

Nous utilisons le modèle GitFlow :

1. **main** - Code de production stable
2. **develop** - Branche de développement principale
3. **feature/\*** - Branches pour les nouvelles fonctionnalités
4. **bugfix/\*** - Branches pour la correction de bugs
5. **release/\*** - Branches pour la préparation des versions

### Processus de Pull Request

1. Créer une branche à partir de develop
2. Développer la fonctionnalité ou corriger le bug
3. Exécuter les tests localement
4. Créer une Pull Request vers develop
5. Attendre la revue de code et l'exécution des tests CI
6. Merger la Pull Request une fois approuvée

### Messages de Commit

Nous suivons le format Conventional Commits :

```
type(scope): description concise

Description détaillée si nécessaire.

Références aux issues: #123, #456
```

Types courants :

- **feat** - Nouvelle fonctionnalité
- **fix** - Correction de bug
- **docs** - Documentation
- **style** - Formatage, point-virgules manquants, etc.
- **refactor** - Refactoring de code
- **test** - Tests
- **chore** - Tâches de maintenance

### Versionnement

Nous suivons le versionnement sémantique (SemVer) :

- **MAJOR** - Changements incompatibles avec les versions précédentes
- **MINOR** - Ajouts de fonctionnalités compatibles avec les versions précédentes
- **PATCH** - Corrections de bugs compatibles avec les versions précédentes

## Ressources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express Documentation](https://expressjs.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
