---
sidebar_position: 2
title: CI/CD with GitHub Actions
description: Guide for setting up and configuring Continuous Integration and Continuous Deployment (CI/CD) for TrioSigno using GitHub Actions.
---

# CI/CD with GitHub Actions

This document describes the configuration of Continuous Integration and Continuous Deployment (CI/CD) for the TrioSigno project using GitHub Actions.

## Overview

The TrioSigno CI/CD pipeline automates the following processes:

1. **Testing** - Running automated tests to verify code quality
2. **Building** - Building the frontend and backend applications
3. **Code Analysis** - Checking code for security and quality issues
4. **Deployment** - Automatically publishing to test and production environments

## Workflow Structure

GitHub Actions workflows are defined in the `.github/workflows/` directory of the project and are organized as follows:

- `ci.yml` - Continuous integration pipeline run on each Pull Request
- `cd-staging.yml` - Automatic deployment to the staging environment
- `cd-production.yml` - Deployment to the production environment

## Continuous Integration Configuration

The continuous integration workflow (`ci.yml`) is triggered on each Pull Request and push to the main branches.

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

## Continuous Deployment Configuration (Staging)

The workflow for deployment to the staging environment (`cd-staging.yml`) is triggered automatically after a merge to the develop branch.

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

## Continuous Deployment Configuration (Production)

The workflow for deployment to the production environment (`cd-production.yml`) is triggered manually or after a merge to the main branch.

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

## GitHub Secrets

The CI/CD workflows use several GitHub secrets that must be configured in the repository settings:

| Secret                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `DOCKER_HUB_USERNAME`        | Docker Hub username                                 |
| `DOCKER_HUB_TOKEN`           | Docker Hub access token                             |
| `STAGING_SERVER_HOST`        | IP address or hostname of the staging server        |
| `STAGING_SERVER_USERNAME`    | SSH username for the staging server                 |
| `STAGING_SERVER_SSH_KEY`     | Private SSH key for accessing the staging server    |
| `PRODUCTION_SERVER_HOST`     | IP address or hostname of the production server     |
| `PRODUCTION_SERVER_USERNAME` | SSH username for the production server              |
| `PRODUCTION_SERVER_SSH_KEY`  | Private SSH key for accessing the production server |

## Environment Configuration

GitHub Actions uses environments to manage deployments. The following environments must be configured:

### Staging Environment

The staging environment is used for integration testing before production deployment.

Configuration:

- **URL**: https://staging.triosigno.com
- **Protection**: None (automatic deployment)

### Production Environment

The production environment requires manual approval before deployment.

Configuration:

- **URL**: https://triosigno.com
- **Protection**: Approval required
- **Approvers**: List of team members authorized to approve deployments

## CI/CD Pipeline Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Local      │     │  GitHub     │     │  Actions    │
│  Developer  │────▶│  Repository │────▶│  CI/CD      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Production │     │  Staging    │
                    │  Server     │◀────│  Server     │
                    └─────────────┘     └─────────────┘
```

## Automated Quality Tests

The CI pipeline includes several types of tests to ensure code quality:

### Linting and Formatting

Checks that the code follows style conventions and best practices:

- ESLint for JavaScript/TypeScript
- Prettier for code formatting

### Unit and Integration Tests

Verifies that individual components and their interactions work correctly:

- Jest for unit tests
- Supertest for API tests

### End-to-End Tests

Verifies the functioning of the application as a whole:

- Playwright for UI testing
- Temporary test database for complete scenarios

## Using Status Badges

You can add CI/CD status badges to your README.md to show the current state of workflows:

```markdown
![CI Pipeline](https://github.com/username/triosigno/actions/workflows/ci.yml/badge.svg)
![Staging Deployment](https://github.com/username/triosigno/actions/workflows/cd-staging.yml/badge.svg)
![Production Deployment](https://github.com/username/triosigno/actions/workflows/cd-production.yml/badge.svg)
```

## Best Practices

1. **Testing before deployment**: All tests must pass before a deployment is authorized.
2. **Progressive deployments**: Changes are first deployed to staging before production.
3. **Manual approval**: Production deployments require manual approval.
4. **Automatic rollback**: In case of deployment failure, an automatic restoration can be configured.
5. **Notifications**: Configure Slack or email notifications for important pipeline events.

## Troubleshooting

### Build Failure

If the build step fails:

1. Check the error logs in the "Actions" tab of GitHub
2. Make sure all dependencies are properly installed
3. Verify that the necessary environment variables are defined

### Deployment Failure

If the deployment fails:

1. Check connectivity to the server (SSH, firewall)
2. Verify that Docker is properly configured on the server
3. Check disk space and available resources on the server
