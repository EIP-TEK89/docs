---
sidebar_position: 2
---

# Configuration

Ce guide vous explique comment configurer l'application TrioSigno après l'installation.

## Variables d'environnement

TrioSigno utilise des fichiers `.env` pour la configuration. Voici les variables d'environnement importantes pour chaque composant.

### Frontend (React)

Créez un fichier `.env.local` dans le dossier `frontend` avec les configurations suivantes :

```env
# API Backend
VITE_API_URL=http://localhost:3333/api
VITE_WS_URL=ws://localhost:3333

# Authentification
VITE_AUTH_COOKIE_NAME=triosigno_auth
VITE_AUTH_EXPIRATION_DAYS=7

# Fonctionnalités
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# Localisation
VITE_DEFAULT_LOCALE=fr
```

### Backend (NestJS)

Créez un fichier `.env` dans le dossier `backend` :

```env
# Serveur
PORT=3333
NODE_ENV=development
API_PREFIX=api
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000

# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/triosigno?schema=public"

# Authentification
JWT_SECRET=change_this_to_a_secure_secret
JWT_EXPIRATION=86400
JWT_REFRESH_EXPIRATION=604800
BCRYPT_SALT_ROUNDS=10

# AI Service
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_TOKEN=your_ai_service_token

# Emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@triosigno.com
```

### Service IA (Python)

Créez un fichier `.env` dans le dossier `ai` :

```env
# Serveur
PORT=5000
DEBUG=False
LOG_LEVEL=INFO

# Modèle
MODEL_PATH=./models/hand_gesture_model_v2.h5
DETECTION_THRESHOLD=0.7
USE_GPU=True

# Authentification
API_TOKEN=your_ai_service_token
```

## Configuration de la base de données

### Initialisation du schéma

Après avoir configuré la variable d'environnement `DATABASE_URL`, exécutez les migrations Prisma :

```bash
cd backend
npx prisma migrate dev
```

### Seeding des données initiales

Pour remplir la base de données avec des données de démarrage :

```bash
cd backend
npx prisma db seed
```

Cela créera :

- Des utilisateurs de test
- Des leçons et exercices de base
- Des badges et récompenses

## Personnalisation de l'application

### Personnalisation du thème

Le thème principal de TrioSigno est configurable dans `frontend/src/styles/theme.ts` :

```typescript
export const theme = {
  colors: {
    primary: "#58cc02",
    primaryDark: "#45a700",
    primaryLight: "#89e219",
    secondary: "#1cb0f6",
    background: "#ffffff",
    text: "#3c3c3c",
    error: "#ea2b2b",
    success: "#2bb673",
    warning: "#ffc800",
  },
  fonts: {
    main: '"Nunito", sans-serif',
    heading: '"Nunito", sans-serif',
    monospace: '"Roboto Mono", monospace',
  },
  // ...autres personnalisations
};
```

### Configuration des leçons

Les leçons sont définies dans la base de données, mais vous pouvez également configurer certains paramètres généraux dans `backend/src/config/lessons.config.ts` :

```typescript
export const lessonsConfig = {
  levels: {
    beginner: {
      requiredXP: 0,
      unlocks: ["basics", "greetings"],
    },
    intermediate: {
      requiredXP: 1000,
      unlocks: ["conversation", "numbers"],
    },
    advanced: {
      requiredXP: 5000,
      unlocks: ["grammar", "expressions"],
    },
  },
  xpSettings: {
    baseXP: 10,
    correctAnswerMultiplier: 2,
    perfectScoreBonus: 50,
    dailyStreakBonus: 20,
  },
};
```

## Configuration pour la production

### HTTPS

Pour configurer HTTPS en production, vous devez mettre en place un certificat SSL. Avec Docker, cela peut être fait en ajoutant un service Nginx comme proxy inversé :

```yaml
# Extrait du docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/conf.d:/etc/nginx/conf.d
    - ./nginx/ssl:/etc/nginx/ssl
    - ./nginx/data/certbot/conf:/etc/letsencrypt
    - ./nginx/data/certbot/www:/var/www/certbot
  depends_on:
    - frontend
  restart: always
```

Avec un fichier de configuration Nginx comme celui-ci :

```nginx
# /nginx/conf.d/default.conf
server {
    listen 80;
    server_name triosigno.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name triosigno.com;

    ssl_certificate /etc/letsencrypt/live/triosigno.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/triosigno.com/privkey.pem;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://backend:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Configuration des ressources

En production, vous devriez ajuster les ressources allouées à chaque service dans Docker :

```yaml
# Extrait du docker-compose.yml
services:
  backend:
    # ...autres configurations
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M

  frontend:
    # ...autres configurations
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M

  ai-service:
    # ...autres configurations
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G
```

## Tests de configuration

Pour vérifier que votre configuration est correcte, exécutez les commandes suivantes :

### Backend

```bash
cd backend
npm run config:validate
```

### Frontend

```bash
cd frontend
npm run config:validate
```

Ces commandes vérifieront que toutes les variables d'environnement nécessaires sont définies et ont les types corrects.
