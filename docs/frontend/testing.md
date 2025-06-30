---
sidebar_position: 4
---

# Tests Frontend

## Introduction

Les tests dans le frontend de TrioSigno sont organisés pour assurer la qualité et la stabilité de l'application. Les tests unitaires et d'intégration sont exécutés via Vitest et React Testing Library.

## Configuration des tests

### Outils de test

- **Vitest** : Remplace Jest comme framework de test, optimisé pour Vite
- **React Testing Library** : Pour tester les composants React
- **Mock Service Worker (MSW)** : Pour simuler les appels API

### Configuration

Le projet est configuré pour exécuter les tests avec Vitest :

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Structure des tests

Les tests sont organisés dans le dossier `__tests__` à côté des fichiers qu'ils testent :

```
src/
  components/
    Button.tsx
    __tests__/
      Button.test.tsx
  hooks/
    useAuth.ts
    __tests__/
      useAuth.test.ts
```

## Types de tests

### 1. Tests unitaires

Les tests unitaires vérifient le comportement isolé des composants, hooks et fonctions utilitaires :

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../Button";

describe("Button component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByText("Click me")).toHaveClass("custom-class");
  });
});
```

### 2. Tests d'intégration

Les tests d'intégration vérifient les interactions entre plusieurs composants ou avec le Context API :

```tsx
// AuthContext.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../../store/auth";
import { LoginForm } from "../LoginForm";
import { mockLoginApi } from "../../../mocks/authMocks";

vi.mock("../../services/apiClient", () => ({
  default: {
    post: vi.fn().mockImplementation(mockLoginApi),
  },
}));

describe("Authentication flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("allows user to login successfully", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeTruthy();
    });
  });
});
```

## Mocking

### Mocking des API

Pour simuler les appels API dans les tests, nous utilisons MSW (Mock Service Worker) :

```typescript
// mocks/handlers.ts
import { rest } from "msw";
import { API_URL } from "../constants/routes";

export const handlers = [
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;

    if (email === "user@example.com" && password === "password123") {
      return res(
        ctx.status(200),
        ctx.json({
          token: "fake-jwt-token",
          user: {
            id: "1",
            email: "user@example.com",
            username: "testuser",
          },
        })
      );
    }

    return res(ctx.status(401), ctx.json({ message: "Invalid credentials" }));
  }),

  // Autres handlers...
];
```

## Bonnes pratiques

1. **Tests axés sur le comportement** : Tester ce que l'utilisateur voit et peut faire, pas l'implémentation
2. **Éviter les tests fragiles** : Utiliser des sélecteurs robustes comme les textes et les rôles ARIA
3. **Isolation** : Chaque test doit être indépendant et ne pas dépendre d'autres tests
4. **Mock judicieux** : Ne mocker que ce qui est nécessaire pour isoler le comportement testé
5. **Tests de régression** : Ajouter des tests pour les bugs corrigés pour éviter les régressions

## Exécution des tests en CI/CD

Les tests sont automatiquement exécutés dans le pipeline CI/CD lors des pull requests et des déploiements :

```yaml
# Extrait du workflow CI
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2
      with:
        version: 10.11.0
    - uses: actions/setup-node@v3
      with:
        node-version: 20
        cache: "pnpm"
    - run: pnpm install
    - run: pnpm test
```

````

### Test de leçon

```typescript
// lessons/lesson-completion.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../fixtures/auth.fixtures";

test.describe("Lesson completion flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to a specific lesson
    await loginAsTestUser(page);
    await page.goto("/lessons/basics/introduction");
  });

  test("should mark lesson as completed and award points", async ({ page }) => {
    // Complete all exercises in the lesson
    await page.click('[data-testid="start-lesson-button"]');

    // First exercise (video watching)
    await page.click('[data-testid="continue-button"]');

    // Second exercise (quiz)
    await page.click('[data-testid="option-2"]'); // Select correct answer
    await page.click('[data-testid="submit-answer-button"]');

    // Third exercise (practice)
    await page.click('[data-testid="skip-practice-button"]'); // For test purposes

    // Check completion screen
    const completionMessage = await page.locator(
      '[data-testid="completion-message"]'
    );
    await expect(completionMessage).toBeVisible();
    await expect(completionMessage).toContainText("Félicitations");

    // Check XP points awarded
    const xpPoints = await page.locator('[data-testid="xp-points"]');
    await expect(xpPoints).toContainText("50 XP");

    // Navigate to dashboard and verify lesson appears as completed
    await page.goto("/dashboard");
    const completedLesson = await page.locator(
      '[data-testid="lesson-card-introduction"] .completed-badge'
    );
    await expect(completedLesson).toBeVisible();
  });
});
````

## Tests de la reconnaissance gestuelle

Pour tester les fonctionnalités de reconnaissance des gestes en langue des signes, nous utilisons une approche combinant des mocks pour les flux vidéo et les réponses de l'API d'IA :

```typescript
// gestures/sign-recognition.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../fixtures/auth.fixtures";
import { mockWebcamStream, mockAIResponse } from "../utils/test-helpers";

test.describe("Sign language recognition", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);

    // Mock webcam stream
    await mockWebcamStream(page);

    // Mock AI recognition responses
    await mockAIResponse(page, {
      gesture: "bonjour",
      confidence: 0.95,
      feedback: {
        accuracy: "high",
        suggestions: [],
      },
    });

    await page.goto("/practice/gestures/basic");
  });

  test("should recognize gesture and provide feedback", async ({ page }) => {
    await page.click('[data-testid="start-recognition-button"]');

    // Wait for recognition to complete
    await page.waitForSelector('[data-testid="recognition-result"]');

    // Check result
    const recognitionResult = await page.locator(
      '[data-testid="recognition-result"]'
    );
    await expect(recognitionResult).toContainText("bonjour");

    // Check feedback
    const accuracyFeedback = await page.locator(
      '[data-testid="accuracy-feedback"]'
    );
    await expect(accuracyFeedback).toContainText("Excellent");

    // Check points awarded
    const pointsAwarded = await page.locator('[data-testid="points-awarded"]');
    await expect(pointsAwarded).toBeVisible();
  });
});
```

## Intégration avec CI/CD

Les tests Playwright sont exécutés automatiquement dans notre pipeline CI/CD avec GitHub Actions :

```yaml
# Extrait du fichier .github/workflows/frontend-tests.yml
name: Frontend E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run Playwright tests
        run: |
          cd frontend
          npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

## Bonnes pratiques

1. **Utiliser des data-testid** : Ajouter des attributs `data-testid` à vos composants pour créer des sélecteurs stables.

2. **Tests indépendants** : Chaque test doit fonctionner indépendamment des autres et nettoyer après lui.

3. **Fixtures réutilisables** : Créer des fixtures pour les tâches communes comme l'authentification.

4. **Tests parallèles** : Configurer Playwright pour exécuter les tests en parallèle pour réduire le temps d'exécution.

5. **Screenshots automatiques** : Configurer Playwright pour prendre des captures d'écran en cas d'échec des tests.

## Dépannage courant

### Problèmes avec les sélecteurs

Si un sélecteur ne fonctionne pas, utilisez l'outil d'inspection de Playwright pour trouver le bon sélecteur :

```bash
npx playwright codegen http://localhost:3000
```

### Tests intermittents

Pour les tests instables, ajoutez des attentes explicites et augmentez les timeouts :

```typescript
// Attendre qu'un élément soit visible avec un timeout plus long
await page.waitForSelector('[data-testid="slow-element"]', { timeout: 10000 });
```

### Tests dans différents navigateurs

Playwright permet de tester sur différents navigateurs :

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: "Chrome",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "Safari",
      use: { browserName: "webkit" },
    },
  ],
};

export default config;
```
