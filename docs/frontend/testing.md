---
sidebar_position: 5
---

# Tests avec Playwright

## Introduction

TrioSigno utilise [Playwright](https://playwright.dev/) pour les tests end-to-end (E2E) du frontend. Cette approche permet de vérifier le comportement de l'application du point de vue de l'utilisateur, en simulant des interactions réelles avec l'interface.

## Configuration

### Installation

Playwright est configuré dans le projet frontend. Voici comment l'installer :

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Structure des tests

Les tests Playwright sont organisés dans le dossier `frontend/tests/e2e` avec la structure suivante :

```
frontend/tests/e2e/
├── auth/
│   ├── login.spec.ts
│   └── signup.spec.ts
├── lessons/
│   ├── lesson-navigation.spec.ts
│   └── lesson-completion.spec.ts
├── profile/
│   └── user-profile.spec.ts
├── fixtures/
│   ├── auth.fixtures.ts
│   └── lesson.fixtures.ts
└── utils/
    ├── test-helpers.ts
    └── api-mocks.ts
```

## Exemples de tests

### Test d'authentification

```typescript
// auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display error with invalid credentials", async ({ page }) => {
    await page.fill('[data-testid="email-input"]', "invalid@example.com");
    await page.fill('[data-testid="password-input"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');

    const errorMessage = await page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Identifiants invalides");
  });

  test("should redirect to dashboard after successful login", async ({
    page,
  }) => {
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Check redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify user info is displayed
    const userGreeting = await page.locator('[data-testid="user-greeting"]');
    await expect(userGreeting).toBeVisible();
  });
});
```

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
```

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
