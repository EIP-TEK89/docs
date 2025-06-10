---
sidebar_position: 2
---

# Configuration

This guide explains how to configure the TrioSigno application after installation.

## Environment Variables

TrioSigno uses `.env` files for configuration. Here are the important environment variables for each component.

### Frontend (React)

Create a `.env.local` file in the `frontend` folder with the following configurations:

```env
# API Backend
VITE_API_URL=http://localhost:3333/api
VITE_WS_URL=ws://localhost:3333

# Authentication
VITE_AUTH_COOKIE_NAME=triosigno_auth
VITE_AUTH_EXPIRATION_DAYS=7

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# Localization
VITE_DEFAULT_LOCALE=fr
```

### Backend (NestJS)

Create a `.env` file in the `backend` folder:

```env
# Server
PORT=3333
NODE_ENV=development
API_PREFIX=api
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/triosigno?schema=public"

# Authentication
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

### AI Service (Python)

Create a `.env` file in the `ai` folder:

```env
# Server
PORT=5000
DEBUG=False
LOG_LEVEL=INFO

# Model
MODEL_PATH=./models/hand_gesture_model_v2.h5
DETECTION_THRESHOLD=0.7
USE_GPU=True

# Authentication
API_TOKEN=your_ai_service_token
```

## Database Configuration

### Schema Initialization

After configuring the `DATABASE_URL` environment variable, run the Prisma migrations:

```bash
cd backend
npx prisma migrate dev
```

### Seeding Initial Data

To populate the database with starter data:

```bash
cd backend
npx prisma db seed
```

This will create:

- Test users
- Basic lessons and exercises
- Badges and rewards

## Application Customization

### Theme Customization

TrioSigno's main theme is configurable in `frontend/src/styles/theme.ts`:

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
  // ...other customizations
};
```

### Lesson Configuration

Lessons are defined in the database, but you can also configure certain general parameters in `backend/src/config/lessons.config.ts`:

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

## Production Configuration

### HTTPS

To configure HTTPS in production, you need to set up an SSL certificate. With Docker, this can be done by adding an Nginx service as a reverse proxy:

```yaml
# Excerpt from docker-compose.yml
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

With an Nginx configuration file like this:

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

### Resource Configuration

In production, you should adjust the resources allocated to each service in Docker:

```yaml
# Excerpt from docker-compose.yml
services:
  backend:
    # ...other configurations
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M

  frontend:
    # ...other configurations
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M

  ai-service:
    # ...other configurations
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G
```

## Configuration Testing

To verify that your configuration is correct, run the following commands:

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

These commands will check that all necessary environment variables are defined and have the correct types.
