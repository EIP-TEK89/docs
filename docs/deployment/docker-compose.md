---
sidebar_position: 1
---

# Déploiement avec Docker Compose

## Introduction

TrioSigno utilise Docker et Docker Compose pour simplifier le déploiement et assurer la cohérence entre les environnements de développement, de test et de production. Cette documentation explique comment configurer et déployer l'application complète avec Docker Compose.

## Prérequis

- Docker (version 20.10.0+)
- Docker Compose (version 2.0.0+)
- Git
- 4 Go de RAM minimum
- 20 Go d'espace disque

## Architecture des conteneurs

TrioSigno est composé de plusieurs services qui fonctionnent ensemble :

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Frontend       │◄────►│  Backend API    │◄────►│  IA Service     │
│  (React)        │      │  (NestJS)       │      │  (Python/Flask) │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        ▼                        │
         │               ┌─────────────────┐               │
         │               │                 │               │
         └──────────────►│  Database       │◄──────────────┘
                         │  (PostgreSQL)   │
                         │                 │
                         └─────────────────┘
```

## Structure du docker-compose.yml

Voici le fichier `docker-compose.yml` complet pour déployer TrioSigno :

```yaml
version: "3.8"

services:
  # Service Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - API_URL=${API_URL:-http://localhost:3000}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - triosigno-network

  # Service Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-triosigno}
      - JWT_SECRET=${JWT_SECRET:-changeme}
      - AI_SERVICE_URL=http://ai-service:5000
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - triosigno-network

  # Service d'IA
  ai-service:
    build:
      context: ./ai
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    volumes:
      - ./ai/models:/app/models
    environment:
      - MODEL_PATH=/app/models/gesture_recognition_v2.h5
      - THRESHOLD=${AI_THRESHOLD:-0.7}
    restart: unless-stopped
    networks:
      - triosigno-network

  # Base de données
  db:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-triosigno}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - triosigno-network

networks:
  triosigno-network:
    driver: bridge

volumes:
  postgres-data:
```

## Configuration de l'environnement

Créez un fichier `.env` à la racine du projet pour configurer les variables d'environnement :

```
# Environnement
NODE_ENV=production

# Base de données
POSTGRES_USER=triosigno_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=triosigno

# Backend
JWT_SECRET=your_very_secure_jwt_secret_key
API_URL=https://api.triosigno.com

# IA
AI_THRESHOLD=0.75
```

## Déploiement étape par étape

### 1. Cloner le dépôt

```bash
git clone https://github.com/triosigno/triosigno.git
cd triosigno
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditez le fichier .env avec vos valeurs spécifiques
```

### 3. Construire et démarrer les conteneurs

```bash
docker-compose build
docker-compose up -d
```

### 4. Initialiser la base de données

```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run seed
```

### 5. Vérifier le déploiement

```bash
docker-compose ps
```

Tous les services devraient être à l'état "Up".

### 6. Accéder à l'application

- Frontend : http://localhost
- Backend API : http://localhost:3000
- IA Service : http://localhost:5000 (habituellement utilisé uniquement en interne)

## Mise à jour de l'application

Pour mettre à jour TrioSigno vers une nouvelle version :

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
docker-compose exec backend npm run prisma:migrate
```

## Scaling

Pour faire face à une charge plus importante, vous pouvez scale certains services :

```bash
docker-compose up -d --scale backend=3 --scale ai-service=2
```

Note : Cela nécessite une configuration supplémentaire avec un load balancer comme Nginx ou Traefik.

## Sauvegarde et restauration

### Sauvegarde de la base de données

```bash
docker-compose exec db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup_$(date +%Y-%m-%d).sql
```

### Restauration de la base de données

```bash
cat backup_file.sql | docker-compose exec -T db psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

## Surveillance et logs

### Afficher les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
```

### Surveillance des conteneurs

Vous pouvez utiliser Prometheus et Grafana pour surveiller vos conteneurs :

```yaml
# À ajouter à votre docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - triosigno-network

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  depends_on:
    - prometheus
  networks:
    - triosigno-network
```

## Résolution des problèmes courants

### Les conteneurs ne démarrent pas

Vérifiez les logs :

```bash
docker-compose logs -f
```

### Problèmes de connexion à la base de données

Vérifiez que les variables d'environnement sont correctement configurées dans le fichier `.env`.

### Le service d'IA ne répond pas

Vérifiez que le modèle est correctement chargé :

```bash
docker-compose logs ai-service
```

## Recommandations pour la production

Pour un environnement de production, nous recommandons :

1. Utiliser un serveur HTTPS avec Let's Encrypt
2. Configurer un load balancer comme Traefik ou Nginx
3. Mettre en place une solution de monitoring comme Prometheus/Grafana
4. Configurer des sauvegardes automatiques de la base de données
5. Utiliser un registre Docker privé pour vos images
