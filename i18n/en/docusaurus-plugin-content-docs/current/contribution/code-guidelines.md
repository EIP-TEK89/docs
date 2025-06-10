---
sidebar_position: 1
title: Code Guidelines
description: Guide to code standards and best practices for contributing to the TrioSigno project.
---

# Code Guidelines

This document defines the standards and best practices to follow when developing and contributing to the TrioSigno project.

## General Principles

We follow these fundamental principles:

1. **Readability** - Code should be easy to read and understand
2. **Maintainability** - Code should be easy to maintain and evolve
3. **Testability** - Code should be easy to test
4. **Performance** - Code should be efficient and optimized
5. **Security** - Code should follow security best practices

## Project Structure

The project is structured according to a modular architecture:

```
triosigno/
├── client/               # Frontend React/Next.js
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Application pages
│   ├── public/           # Static files
│   ├── styles/           # Global styles and themes
│   └── utils/            # Frontend utilities
│
├── server/               # Backend Node.js/Express
│   ├── api/              # API routes and controllers
│   ├── config/           # Server configuration
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── services/         # Business services
│   └── utils/            # Backend utilities
│
├── shared/               # Shared frontend/backend code
│   ├── constants/        # Shared constants
│   ├── types/            # Shared TypeScript types
│   └── validation/       # Validation schemas
│
├── ia/                   # Artificial Intelligence components
│   ├── models/           # Trained AI models
│   ├── training/         # Training scripts
│   └── utils/            # AI utilities
│
├── prisma/               # Prisma schema and migrations
│
├── tests/                # Global tests
│   ├── e2e/              # End-to-end tests
│   └── integration/      # Integration tests
│
└── scripts/              # Utility scripts
```

## Code Standards

### TypeScript

We use TypeScript to benefit from static typing:

```typescript
// Prefer interfaces for data structures
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Use types for unions and utility types
type UserRole = "admin" | "teacher" | "student";
type UserWithoutId = Omit<User, "id">;

// Avoid any, prefer unknown if necessary
function processData(data: unknown): void {
  if (isUser(data)) {
    // Type is now User
    console.log(data.username);
  }
}

// Type guard function
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

### Naming

We follow these naming conventions:

- **PascalCase** for classes, interfaces, types, and React components
- **camelCase** for variables, functions, and properties
- **UPPER_CASE** for constants
- **kebab-case** for CSS files and URLs

```typescript
// Constants
const MAX_RETRY_ATTEMPTS = 3;

// Variables
const userProfile = getUserProfile();

// Functions
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

// React Components
function UserProfileCard({ user }: UserProfileCardProps) {
  // ...
}
```

### Formatting

We use ESLint and Prettier to ensure code consistency. Configuration files are included in the project.

ESLint configuration:

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

Prettier configuration:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Comments

We follow these practices for comments:

- JSDoc comments for public functions and classes
- Simple comments to explain complex logic
- Avoid comments that simply repeat the code

```typescript
/**
 * Calculates the mastery level of a sign for a user.
 *
 * @param userId - The user's ID
 * @param signId - The sign's ID
 * @returns The mastery level between 0 and 100
 */
async function calculateMasteryLevel(
  userId: string,
  signId: string
): Promise<number> {
  // Get attempt history
  const attempts = await getAttemptHistory(userId, signId);

  // Use a weighted average of the last 10 attempts
  // where recent attempts have more weight
  const recentAttempts = attempts.slice(-10);

  // ...complex calculation...

  return masteryLevel;
}
```

## Frontend

### React Components

We use functional components with hooks:

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
    // Load user progress for this lesson
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
      <Button onClick={onStart}>Start</Button>
    </div>
  );
}
```

### State Management

We use a combination of React hooks (useState, useReducer) and React Context for state management:

```tsx
// Context for authentication management
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

We use a combination of CSS Modules and Tailwind CSS:

```tsx
// Example with CSS Modules
import styles from "./Button.module.css";

export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

// Example with Tailwind CSS
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

We follow a layered architecture:

1. **Routes** - Define API endpoints
2. **Controllers** - Handle requests and responses
3. **Services** - Contain business logic
4. **Models** - Define data structure

```typescript
// Route
import express from "express";
import { getLessons, getLessonById } from "../controllers/lessonController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/lessons", authenticate, getLessons);
router.get("/lessons/:id", authenticate, getLessonById);

export default router;

// Controller
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

### Error Handling

We use a centralized error handling middleware:

```typescript
import { Request, Response, NextFunction } from "express";

// Custom error types
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

// Error handling middleware
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

We use Zod for data validation:

```typescript
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Validation schema for user creation
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Validation middleware
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

## Testing

### Unit Tests

We use Jest for unit testing:

```typescript
import { calculateMasteryLevel } from "./masteryCalculator";
import { getAttemptHistory } from "./attemptService";

// Mock dependencies
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
    // Configure mock to return test data
    (getAttemptHistory as jest.Mock).mockResolvedValue([
      { correct: true, date: new Date("2023-01-01") },
      { correct: false, date: new Date("2023-01-02") },
      { correct: true, date: new Date("2023-01-03") },
    ]);

    const result = await calculateMasteryLevel("user1", "sign1");

    // Verify that the result matches what we expect
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

We use Supertest to test APIs:

```typescript
import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/database";
import { createUser, generateAuthToken } from "../utils/testHelpers";

describe("Lesson API", () => {
  let authToken: string;

  beforeAll(async () => {
    // Create a test user and generate a token
    const user = await createUser({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    authToken = generateAuthToken(user);
  });

  afterAll(async () => {
    // Clean up the database
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
    // Create a test lesson
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

### End-to-End Tests

We use Playwright for end-to-end tests:

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

## Security

### Authentication

We use JWT (JSON Web Tokens) for authentication:

```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { UnauthorizedError } from "../utils/errors";

export class AuthService {
  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate JWT token
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

### Input Validation

We validate all user inputs:

```typescript
import { z } from "zod";

// Validation schema for query parameters
const lessonQuerySchema = z.object({
  moduleId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
});

// Validate and extract parameters
export function validateLessonQuery(query: any) {
  return lessonQuerySchema.parse(query);
}
```

### Protection Against Common Attacks

We implement protections against common attacks:

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

export function configureSecurityMiddleware(app) {
  // HTTP header protection
  app.use(helmet());

  // Rate limiting to prevent brute force attacks
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per IP
      message: "Too many login attempts, please try again later",
    })
  );

  // XSS attack protection
  app.use(xss());

  // HTTP parameter pollution protection
  app.use(hpp());
}
```

## Development Process

### Git Workflow

We use the GitFlow model:

1. **main** - Stable production code
2. **develop** - Main development branch
3. **feature/\*** - Branches for new features
4. **bugfix/\*** - Branches for bug fixes
5. **release/\*** - Branches for version preparation

### Pull Request Process

1. Create a branch from develop
2. Develop the feature or fix the bug
3. Run tests locally
4. Create a Pull Request to develop
5. Wait for code review and CI tests execution
6. Merge the Pull Request once approved

### Commit Messages

We follow the Conventional Commits format:

```
type(scope): concise description

Detailed description if necessary.

Issue references: #123, #456
```

Common types:

- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation
- **style** - Formatting, missing semicolons, etc.
- **refactor** - Code refactoring
- **test** - Tests
- **chore** - Maintenance tasks

### Versioning

We follow Semantic Versioning (SemVer):

- **MAJOR** - Changes incompatible with previous versions
- **MINOR** - Backward-compatible feature additions
- **PATCH** - Backward-compatible bug fixes

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express Documentation](https://expressjs.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
