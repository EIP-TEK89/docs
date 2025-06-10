---
sidebar_position: 1
---

# Installation

Ce guide vous aidera à installer et configurer TrioSigno pour le développement ou la production.

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre système :

- **Node.js** (v16+)
- **npm** (v7+) ou **yarn** (v1.22+)
- **Python** (v3.8+)
- **PostgreSQL** (v13+)
- **Docker** et **Docker Compose** (pour le déploiement)
- **Git**

## Installation pour le développement

### 1. Cloner le dépôt

```bash
git clone https://github.com/triosigno/triosigno.git
cd triosigno
```

### 2. Configurer le frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Modifiez .env.local selon vos besoins
```

### 3. Configurer le backend

```bash
cd ../backend
npm install
cp .env.example .env
# Modifiez .env selon vos besoins
```

### 4. Configurer le service d'IA

```bash
cd ../ai
python -m venv venv
source venv/bin/activate  # Sous Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Modifiez .env selon vos besoins
```

### 5. Configurer la base de données

```bash
# Assurez-vous que PostgreSQL est en cours d'exécution
cd ../backend
npx prisma migrate dev
npx prisma db seed
```

### 6. Lancer les services en développement

#### Frontend

```bash
cd ../frontend
npm run dev
```

#### Backend

```bash
cd ../backend
npm run start:dev
```

#### Service d'IA

```bash
cd ../ai
python app.py
```

Le frontend sera accessible à l'adresse http://localhost:3000, l'API backend à http://localhost:3333, et le service d'IA à http://localhost:5000.

## Installation avec Docker Compose

Pour un déploiement plus simple, vous pouvez utiliser Docker Compose qui configurera automatiquement tous les services.

### 1. Cloner le dépôt

```bash
git clone https://github.com/triosigno/triosigno.git
cd triosigno
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Modifiez le fichier .env selon vos besoins
```

### 3. Lancer avec Docker Compose

```bash
docker-compose up -d
```

Cette commande va construire et démarrer tous les services nécessaires. L'application sera accessible à l'adresse http://localhost.

### 4. Initialiser la base de données (première fois uniquement)

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

## Vérification de l'installation

Pour vérifier que tout fonctionne correctement :

1. Accédez au frontend dans votre navigateur
2. Essayez de vous inscrire et de vous connecter
3. Vérifiez que vous pouvez accéder aux leçons
4. Testez la reconnaissance des gestes avec votre caméra

## Configuration avancée

### Utilisation d'un GPU pour l'IA

Si vous disposez d'un GPU compatible avec TensorFlow, vous pouvez configurer le service d'IA pour l'utiliser :

```yaml
# Dans docker-compose.yml
ai-service:
  # ...
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### Configuration HTTPS

Pour configurer HTTPS en production, ajoutez un proxy inverse comme Nginx :

```yaml
# Exemple d'ajout à docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/conf.d:/etc/nginx/conf.d
    - ./nginx/ssl:/etc/nginx/ssl
  depends_on:
    - frontend
    - backend
  networks:
    - triosigno-network
```

## Résolution des problèmes courants

### Problème de connexion à la base de données

Vérifiez que PostgreSQL est en cours d'exécution et que les informations de connexion dans `.env` sont correctes.

### Le service d'IA ne démarre pas

Assurez-vous que Python et toutes les dépendances sont correctement installés. Vérifiez les logs pour plus de détails.

### Erreur lors de la construction des conteneurs Docker

Essayez de nettoyer le cache Docker et de reconstruire :

```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## Mise à jour

Pour mettre à jour TrioSigno vers la dernière version :

```bash
git pull
npm install  # Dans les dossiers frontend et backend
docker-compose down
docker-compose up -d --build  # Si vous utilisez Docker
```

## Support

Si vous rencontrez des problèmes lors de l'installation, n'hésitez pas à :

- Consulter la [documentation complète](https://doc.triosigno.com)
- Ouvrir une [issue sur GitHub](https://github.com/triosigno/triosigno/issues)
- Rejoindre notre [serveur Discord](https://discord.gg/triosigno) pour obtenir de l'aide
