---
sidebar_position: 3
---

# API Endpoints

Cette page documente les endpoints API disponibles dans le backend Trio Signo. La documentation complète et interactive est accessible via Swagger lorsque le serveur est en cours d'exécution.

## Base URL

```
http://localhost:3000/api
```

## Documentation Swagger

Une documentation Swagger complète et interactive est disponible à l'adresse suivante lorsque le serveur est en cours d'exécution:

```
http://localhost:3000/api/docs
```

Cette documentation permet de:

- Explorer tous les endpoints disponibles
- Tester les requêtes directement depuis l'interface
- Comprendre la structure des données attendues et retournées

## Endpoints principaux

Le backend Trio Signo expose plusieurs groupes d'endpoints pour gérer les différentes fonctionnalités de l'application:

### Auth

Les endpoints d'authentification gèrent l'inscription, la connexion et la gestion des tokens.

- `POST /auth/register` - Inscription d'un nouvel utilisateur
- `POST /auth/login` - Connexion d'un utilisateur existant
- `POST /auth/refresh` - Rafraîchissement du token d'authentification
- `POST /auth/logout` - Déconnexion de l'utilisateur

### Users

Les endpoints utilisateurs permettent de gérer les profils et informations des utilisateurs.

- `GET /users/me` - Récupération du profil de l'utilisateur connecté
- `PATCH /users/me` - Mise à jour du profil de l'utilisateur connecté
- `GET /users` - Liste des utilisateurs (admin)
- `GET /users/:id` - Détails d'un utilisateur spécifique (admin)
- `DELETE /users/:id` - Suppression d'un utilisateur (admin)

### Dictionary

Les endpoints du dictionnaire permettent de consulter et rechercher des signes.

- `GET /dictionary` - Recherche dans le dictionnaire de signes
- `GET /dictionary/:id` - Détails d'un signe spécifique
- `GET /dictionary/categories` - Liste des catégories de signes
- `POST /dictionary` - Ajout d'un nouveau signe (admin)
- `PATCH /dictionary/:id` - Mise à jour d'un signe (admin)
- `DELETE /dictionary/:id` - Suppression d'un signe (admin)

### Lessons

Les endpoints de leçons gèrent l'accès aux leçons et le suivi de la progression.

- `GET /lessons` - Liste des leçons disponibles
- `GET /lessons/:id` - Détails d'une leçon spécifique
- `POST /lessons/:id/start` - Démarrage d'une leçon
- `POST /lessons/:id/complete` - Marquer une leçon comme terminée
- `POST /lessons` - Création d'une nouvelle leçon (admin)
- `PATCH /lessons/:id` - Mise à jour d'une leçon (admin)
- `DELETE /lessons/:id` - Suppression d'une leçon (admin)

### Exercises

Les endpoints d'exercices permettent d'interagir avec les exercices dans les leçons.

- `GET /exercises/:id` - Détails d'un exercice spécifique
- `POST /exercises/:id/submit` - Soumission d'une réponse à un exercice
- `POST /exercises` - Création d'un nouvel exercice (admin)
- `PATCH /exercises/:id` - Mise à jour d'un exercice (admin)
- `DELETE /exercises/:id` - Suppression d'un exercice (admin)

## Format des réponses

Toutes les réponses API suivent un format standard:

### Succès

```json
{
  "success": true,
  "data": {
    // Données spécifiques à l'endpoint
  },
  "message": "Message de succès optionnel"
}
```

### Erreur

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Message d'erreur",
    "details": {
      // Détails supplémentaires de l'erreur (optionnel)
    }
  }
}
```

## Authentification

La plupart des endpoints nécessitent une authentification. Pour accéder à ces endpoints, vous devez inclure un token JWT dans l'en-tête de la requête:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ce token est obtenu lors de la connexion ou du rafraîchissement du token.

## Exemples de requêtes

### Inscription d'un utilisateur

**Requête:**

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "user123",
  "password": "Password123!"
}
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "email": "user@example.com",
    "username": "user123",
    "createdAt": "2025-06-11T14:30:45Z"
  },
  "message": "Inscription réussie"
}
```

### Connexion d'un utilisateur

**Requête:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "email": "user@example.com",
      "username": "user123"
    }
  },
  "message": "Connexion réussie"
}
```

### Récupération des leçons

**Requête:**

```http
GET /lessons
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse:**

```json
{
  "success": true,
  "data": [
    {
      "id": "lesson1",
      "title": "Introduction à la langue des signes",
      "description": "Apprenez les bases de la langue des signes",
      "difficulty": "beginner",
      "category": "basics",
      "duration": 15
    },
    {
      "id": "lesson2",
      "title": "Alphabet en langue des signes",
      "description": "Maîtrisez l'alphabet en langue des signes",
      "difficulty": "beginner",
      "category": "alphabet",
      "duration": 20
    }
  ]
}
```

## Codes de statut HTTP

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | OK - La requête a réussi                 |
| 201  | Created - Une ressource a été créée      |
| 400  | Bad Request - La requête est mal formée  |
| 401  | Unauthorized - Authentification requise  |
| 403  | Forbidden - Accès refusé                 |
| 404  | Not Found - Ressource non trouvée        |
| 422  | Unprocessable Entity - Données invalides |
| 500  | Internal Server Error - Erreur serveur   |
