---
sidebar_position: 2
title: CI/CD avec GitHub Actions
description: Guide pour la mise en place et la configuration de l'intégration continue et du déploiement continu (CI/CD) pour TrioSigno à l'aide de GitHub Actions.
---

# CI/CD avec GitHub Actions

Ce document décrit la configuration de l'intégration continue et du déploiement continu (CI/CD) pour le projet TrioSigno en utilisant GitHub Actions.

## Vue d'ensemble

Le pipeline CI/CD de TrioSigno automatise les processus suivants :

1. **Tests** - Exécution de tests automatisés pour vérifier la qualité du code
2. **Compilation** - Construction des applications frontend et backend
3. **Analyse de code** - Vérification du code pour les problèmes de sécurité et de qualité
4. **Déploiement** - Publication automatique vers les environnements de test et de production

## Structure des Workflows

Les workflows GitHub Actions sont définis dans le répertoire `.github/workflows/` du projet et sont organisés comme suit :

- `ci.yml` - Pipeline d'intégration continue exécuté sur chaque Pull Request
- `cd-staging.yml` - Déploiement automatique vers l'environnement de staging
- `cd-production.yml` - Déploiement vers l'environnement de production

## Configuration de l'Intégration Continue

Le workflow d'intégration continue (`ci.yml`) est déclenché à chaque Pull Request et push sur les branches principales.

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Code Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Run ESLint
        run: npm run lint
      - name: Run Prettier check
        run: npm run format:check

  test:
    name: Unit and Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: triosigno_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/triosigno_test
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/triosigno_test
          JWT_SECRET: test_jwt_secret
          NODE_ENV: test

  e2e-test:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: triosigno_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/triosigno_test
      - name: Build frontend
        run: npm run build
        env:
          NODE_ENV: test
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/triosigno_test
          JWT_SECRET: test_jwt_secret
          NODE_ENV: test

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            build/
```

## Configuration du Déploiement Continu (Staging)

Le workflow de déploiement vers l'environnement de staging (`cd-staging.yml`) est déclenché automatiquement après un merge sur la branche develop.

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    name: Deploy to Staging Environment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      - name: Build and push Docker images
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: triosigno/app:staging
      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_SERVER_HOST }}
          username: ${{ secrets.STAGING_SERVER_USERNAME }}
          key: ${{ secrets.STAGING_SERVER_SSH_KEY }}
          script: |
            cd /opt/triosigno
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

## Configuration du Déploiement Continu (Production)

Le workflow de déploiement vers l'environnement de production (`cd-production.yml`) est déclenché manuellement ou après un merge sur la branche main.

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-production:
    name: Deploy to Production Environment
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      - name: Build and push Docker images
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: triosigno/app:latest,triosigno/app:${{ github.sha }}
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_SERVER_HOST }}
          username: ${{ secrets.PRODUCTION_SERVER_USERNAME }}
          key: ${{ secrets.PRODUCTION_SERVER_SSH_KEY }}
          script: |
            cd /opt/triosigno
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

## Secrets GitHub

Les workflows CI/CD utilisent plusieurs secrets GitHub qui doivent être configurés dans les paramètres du repository :

| Secret                       | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `DOCKER_HUB_USERNAME`        | Nom d'utilisateur Docker Hub                         |
| `DOCKER_HUB_TOKEN`           | Token d'accès Docker Hub                             |
| `STAGING_SERVER_HOST`        | Adresse IP ou nom d'hôte du serveur de staging       |
| `STAGING_SERVER_USERNAME`    | Nom d'utilisateur SSH pour le serveur de staging     |
| `STAGING_SERVER_SSH_KEY`     | Clé SSH privée pour l'accès au serveur de staging    |
| `PRODUCTION_SERVER_HOST`     | Adresse IP ou nom d'hôte du serveur de production    |
| `PRODUCTION_SERVER_USERNAME` | Nom d'utilisateur SSH pour le serveur de production  |
| `PRODUCTION_SERVER_SSH_KEY`  | Clé SSH privée pour l'accès au serveur de production |

## Configuration des Environnements

GitHub Actions utilise des environnements pour gérer les déploiements. Les environnements suivants doivent être configurés :

### Environnement de Staging

L'environnement de staging est utilisé pour les tests d'intégration avant la mise en production.

Configuration :

- **URL** : https://staging.triosigno.com
- **Protection** : Aucune (déploiement automatique)

### Environnement de Production

L'environnement de production nécessite une approbation manuelle avant le déploiement.

Configuration :

- **URL** : https://triosigno.com
- **Protection** : Approbation requise
- **Approbateurs** : Liste des membres de l'équipe autorisés à approuver les déploiements

## Schéma du Pipeline CI/CD

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Développeur│     │  GitHub     │     │  Actions    │
│  local      │────▶│  Repository │────▶│  CI/CD      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Production │     │  Staging    │
                    │  Server     │◀────│  Server     │
                    └─────────────┘     └─────────────┘
```

## Tests de Qualité Automatisés

Le pipeline CI inclut plusieurs types de tests pour assurer la qualité du code :

### Linting et Formatage

Vérifie que le code respecte les conventions de style et les bonnes pratiques :

- ESLint pour JavaScript/TypeScript
- Prettier pour le formatage de code

### Tests Unitaires et d'Intégration

Vérifie que les composants individuels et leurs interactions fonctionnent correctement :

- Jest pour les tests unitaires
- Supertest pour les tests d'API

### Tests End-to-End

Vérifie le fonctionnement de l'application dans son ensemble :

- Playwright pour les tests de l'interface utilisateur
- Base de données de test temporaire pour les scénarios complets

## Utilisation des Badges de Statut

Vous pouvez ajouter des badges de statut CI/CD à votre README.md pour montrer l'état actuel des workflows :

```markdown
![CI Pipeline](https://github.com/username/triosigno/actions/workflows/ci.yml/badge.svg)
![Staging Deployment](https://github.com/username/triosigno/actions/workflows/cd-staging.yml/badge.svg)
![Production Deployment](https://github.com/username/triosigno/actions/workflows/cd-production.yml/badge.svg)
```

## Bonnes Pratiques

1. **Tests avant le déploiement** : Tous les tests doivent réussir avant qu'un déploiement ne soit autorisé.
2. **Déploiements progressifs** : Les modifications sont d'abord déployées en staging avant la production.
3. **Approbation manuelle** : Les déploiements en production requièrent une approbation manuelle.
4. **Réversion automatique** : En cas d'échec du déploiement, une restauration automatique peut être configurée.
5. **Notifications** : Configuration de notifications Slack ou par e-mail pour les événements importants du pipeline.

## Résolution des Problèmes

### Échec de la Construction

Si l'étape de construction échoue :

1. Vérifiez les journaux d'erreur dans l'onglet "Actions" de GitHub
2. Assurez-vous que toutes les dépendances sont correctement installées
3. Vérifiez que les variables d'environnement nécessaires sont définies

### Échec du Déploiement

Si le déploiement échoue :

1. Vérifiez la connectivité au serveur (SSH, pare-feu)
2. Vérifiez que Docker est correctement configuré sur le serveur
3. Vérifiez l'espace disque et les ressources disponibles sur le serveur
