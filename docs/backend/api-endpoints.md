---
sidebar_position: 3
---

# API Endpoints

Cette page documente les endpoints API RESTful disponibles dans le backend TrioSigno.

## Base URL

```
https://api.triosigno.com/api/v1
```

En développement local :

```
http://localhost:3333/api/v1
```

## Format de réponse standard

Toutes les réponses API suivent un format standard :

```json
{
  "success": true,
  "data": {
    /* Les données de la réponse */
  },
  "message": "Message optionnel",
  "errors": null
}
```

En cas d'erreur :

```json
{
  "success": false,
  "data": null,
  "message": "Message d'erreur général",
  "errors": [
    {
      "field": "username",
      "message": "Le nom d'utilisateur est déjà pris"
    }
  ]
}
```

## Authentication

### Inscription

```
POST /auth/register
```

**Corps de la requête :**

```json
{
  "username": "jean_dupont",
  "email": "jean.dupont@example.com",
  "password": "P@ssw0rd123"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jean_dupont",
    "email": "jean.dupont@example.com",
    "createdAt": "2023-09-15T14:30:45Z"
  },
  "message": "Inscription réussie"
}
```

### Connexion

```
POST /auth/login
```

**Corps de la requête :**

```json
{
  "email": "jean.dupont@example.com",
  "password": "P@ssw0rd123"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "jean_dupont",
      "email": "jean.dupont@example.com",
      "level": 1,
      "xp": 0
    }
  },
  "message": "Connexion réussie"
}
```

### Rafraîchir le token

```
POST /auth/refresh
```

**Corps de la requête :**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token rafraîchi avec succès"
}
```

### Déconnexion

```
POST /auth/logout
```

**Réponse :**

```json
{
  "success": true,
  "data": null,
  "message": "Déconnexion réussie"
}
```

## Utilisateurs

### Obtenir le profil de l'utilisateur actuel

```
GET /users/me
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jean_dupont",
    "email": "jean.dupont@example.com",
    "profilePicture": "https://api.triosigno.com/uploads/avatars/jean_dupont.jpg",
    "level": 3,
    "xp": 1250,
    "dailyStreak": 5,
    "lastActive": "2023-09-15T18:30:00Z",
    "badges": [
      {
        "id": "badge1",
        "name": "Premier pas",
        "description": "Complété la première leçon",
        "imageUrl": "https://api.triosigno.com/assets/badges/first_step.png"
      }
    ],
    "statistics": {
      "lessonsCompleted": 12,
      "perfectLessons": 8,
      "totalXpEarned": 1500,
      "timeSpent": 360 // minutes
    }
  }
}
```

### Mettre à jour le profil utilisateur

```
PATCH /users/me
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Corps de la requête :**

```json
{
  "username": "jean_dupont_2",
  "profilePicture": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jean_dupont_2",
    "profilePicture": "https://api.triosigno.com/uploads/avatars/jean_dupont_2.jpg",
    "updatedAt": "2023-09-16T10:15:30Z"
  },
  "message": "Profil mis à jour avec succès"
}
```

### Obtenir le classement des utilisateurs

```
GET /users/leaderboard?page=1&limit=10
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "userId": "user123",
        "username": "champion_lsf",
        "level": 10,
        "xp": 12500,
        "profilePicture": "https://api.triosigno.com/uploads/avatars/champion_lsf.jpg"
      },
      {
        "rank": 2,
        "userId": "user456",
        "username": "signmaster",
        "level": 9,
        "xp": 11200,
        "profilePicture": "https://api.triosigno.com/uploads/avatars/signmaster.jpg"
      }
    ],
    "userRank": {
      "rank": 15,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "jean_dupont_2",
      "level": 3,
      "xp": 1250
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalUsers": 42
    }
  }
}
```

## Leçons

### Obtenir toutes les leçons

```
GET /lessons?category=basics&difficulty=beginner
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "lesson1",
        "title": "Introduction à la LSF",
        "description": "Apprenez les bases de la langue des signes française",
        "category": "basics",
        "difficulty": "beginner",
        "duration": 15, // minutes
        "thumbnail": "https://api.triosigno.com/assets/lessons/intro.jpg",
        "progress": 100, // pourcentage
        "completed": true,
        "unlocked": true
      },
      {
        "id": "lesson2",
        "title": "Alphabet LSF",
        "description": "Maîtrisez l'alphabet en langue des signes",
        "category": "basics",
        "difficulty": "beginner",
        "duration": 20,
        "thumbnail": "https://api.triosigno.com/assets/lessons/alphabet.jpg",
        "progress": 50,
        "completed": false,
        "unlocked": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 3,
      "totalLessons": 25
    }
  }
}
```

### Obtenir une leçon spécifique

```
GET /lessons/{lessonId}
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "lesson1",
    "title": "Introduction à la LSF",
    "description": "Apprenez les bases de la langue des signes française",
    "category": "basics",
    "difficulty": "beginner",
    "duration": 15,
    "thumbnail": "https://api.triosigno.com/assets/lessons/intro.jpg",
    "content": {
      "introduction": "La Langue des Signes Française (LSF) est une langue visuelle utilisée par la communauté sourde en France...",
      "videoUrl": "https://api.triosigno.com/assets/videos/intro_lsf.mp4"
    },
    "exercises": [
      {
        "id": "ex1",
        "type": "video",
        "title": "Observer le signe",
        "content": {
          "videoUrl": "https://api.triosigno.com/assets/videos/sign_hello.mp4",
          "description": "Observez attentivement comment le signe 'Bonjour' est réalisé"
        }
      },
      {
        "id": "ex2",
        "type": "quiz",
        "title": "Quiz: Reconnaître le signe",
        "content": {
          "question": "Quel est ce signe ?",
          "videoUrl": "https://api.triosigno.com/assets/videos/sign_question.mp4",
          "options": [
            {
              "id": "opt1",
              "text": "Bonjour",
              "correct": false
            },
            {
              "id": "opt2",
              "text": "Question",
              "correct": true
            },
            {
              "id": "opt3",
              "text": "Au revoir",
              "correct": false
            }
          ]
        }
      },
      {
        "id": "ex3",
        "type": "practice",
        "title": "Pratiquer le signe",
        "content": {
          "instruction": "Faites le signe 'Bonjour' devant votre caméra",
          "targetSign": "bonjour",
          "attemptsAllowed": 3
        }
      }
    ],
    "progress": {
      "completed": true,
      "lastCompleted": "2023-09-14T16:45:30Z",
      "bestScore": 95,
      "attempts": 2
    },
    "prerequisites": [],
    "nextLessons": ["lesson2", "lesson3"]
  }
}
```

### Commencer une leçon

```
POST /lessons/{lessonId}/start
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid-123",
    "startedAt": "2023-09-16T14:30:00Z"
  },
  "message": "Leçon démarrée"
}
```

### Compléter une leçon

```
POST /lessons/{lessonId}/complete
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Corps de la requête :**

```json
{
  "sessionId": "session-uuid-123",
  "exercisesResults": [
    {
      "exerciseId": "ex1",
      "completed": true,
      "score": 100
    },
    {
      "exerciseId": "ex2",
      "completed": true,
      "score": 100,
      "answer": "opt2"
    },
    {
      "exerciseId": "ex3",
      "completed": true,
      "score": 85,
      "attempts": 2
    }
  ]
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "lessonId": "lesson1",
    "completed": true,
    "score": 95,
    "rewards": {
      "xp": 50,
      "badges": [
        {
          "id": "badge2",
          "name": "Premier parfait",
          "description": "Obtenir un score parfait sur une leçon",
          "imageUrl": "https://api.triosigno.com/assets/badges/perfect_score.png",
          "isNew": true
        }
      ],
      "levelUp": {
        "newLevel": 4,
        "previousLevel": 3,
        "unlockedContent": [
          {
            "type": "lesson",
            "id": "lesson10",
            "title": "Expressions avancées"
          }
        ]
      }
    }
  },
  "message": "Leçon complétée avec succès"
}
```

## Exercices

### Soumettre une réponse à un exercice

```
POST /exercises/{exerciseId}/submit
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Corps de la requête :**

```json
{
  "sessionId": "session-uuid-123",
  "answer": "opt2", // Pour un quiz
  "gestureData": null // Pour un exercice pratique, contient les données du geste
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "correct": true,
    "score": 100,
    "feedback": "Excellente réponse !",
    "explanation": "Le signe 'Question' se fait avec...",
    "nextExerciseId": "ex3"
  }
}
```

### Soumettre un exercice pratique

```
POST /exercises/{exerciseId}/submit-gesture
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Corps de la requête :**

```
sessionId: session-uuid-123
videoData: [BINARY_DATA]
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "gestureRecognized": "bonjour",
    "accuracy": 85,
    "score": 85,
    "feedback": "Bon travail ! Votre mouvement est presque parfait.",
    "suggestions": [
      "Essayez de garder vos doigts plus droits",
      "Le mouvement doit être un peu plus ample"
    ],
    "nextExerciseId": null,
    "lessonCompleted": true
  }
}
```

## Progression

### Obtenir la progression de l'utilisateur

```
GET /progress
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "jean_dupont_2",
      "level": 3,
      "xp": 1250,
      "xpToNextLevel": 250
    },
    "lessonsProgress": {
      "completed": 12,
      "total": 25,
      "percentageCompleted": 48
    },
    "categories": {
      "basics": {
        "completed": 5,
        "total": 8,
        "percentageCompleted": 62.5
      },
      "greetings": {
        "completed": 3,
        "total": 5,
        "percentageCompleted": 60
      },
      "conversation": {
        "completed": 4,
        "total": 12,
        "percentageCompleted": 33.33
      }
    },
    "streak": {
      "current": 5,
      "longest": 15,
      "lastActivity": "2023-09-16T10:15:30Z"
    },
    "recentActivity": [
      {
        "type": "lesson_completed",
        "date": "2023-09-16T10:15:30Z",
        "details": {
          "lessonId": "lesson5",
          "lessonTitle": "Les couleurs en LSF",
          "score": 90
        }
      },
      {
        "type": "badge_earned",
        "date": "2023-09-15T18:30:00Z",
        "details": {
          "badgeId": "badge3",
          "badgeName": "Persévérant",
          "badgeDescription": "Connexion 5 jours d'affilée"
        }
      }
    ]
  }
}
```

### Obtenir les statistiques détaillées

```
GET /progress/statistics
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "overall": {
      "lessonsCompleted": 12,
      "exercisesCompleted": 68,
      "perfectLessons": 8,
      "averageScore": 87.5,
      "totalXpEarned": 1500,
      "timeSpent": 360, // minutes
      "badgesEarned": 5
    },
    "daily": [
      {
        "date": "2023-09-10",
        "lessonsCompleted": 2,
        "exercisesCompleted": 12,
        "xpEarned": 120,
        "timeSpent": 45
      },
      {
        "date": "2023-09-11",
        "lessonsCompleted": 1,
        "exercisesCompleted": 6,
        "xpEarned": 70,
        "timeSpent": 30
      }
    ],
    "weekly": {
      "lessonsCompleted": 5,
      "exercisesCompleted": 30,
      "xpEarned": 350,
      "timeSpent": 180
    },
    "monthly": {
      "lessonsCompleted": 12,
      "exercisesCompleted": 68,
      "xpEarned": 1500,
      "timeSpent": 360
    },
    "bestPerformance": {
      "lessonId": "lesson3",
      "lessonTitle": "Les nombres en LSF",
      "score": 100,
      "completedAt": "2023-09-12T14:20:15Z"
    }
  }
}
```

## IA Gesture Recognition

### Analyser un geste

```
POST /ai/analyze-gesture
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Corps de la requête :**

```
videoData: [BINARY_DATA]
targetGesture: bonjour (optionnel)
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "gestureRecognized": "bonjour",
    "confidence": 0.92,
    "alternatives": [
      {
        "gesture": "salut",
        "confidence": 0.05
      },
      {
        "gesture": "merci",
        "confidence": 0.02
      }
    ],
    "feedback": {
      "accuracy": "high",
      "handPosition": "good",
      "movement": "good",
      "speed": "slightly_fast",
      "suggestions": ["Essayez de ralentir légèrement le mouvement"]
    },
    "matchesTarget": true,
    "frameDurations": {
      "total": 450, // ms
      "detection": 150,
      "analysis": 300
    }
  }
}
```

### Obtenir la liste des gestes reconnaissables

```
GET /ai/recognized-gestures
```

**En-têtes :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "basics",
        "gestures": [
          {
            "id": "bonjour",
            "name": "Bonjour",
            "difficulty": "beginner"
          },
          {
            "id": "merci",
            "name": "Merci",
            "difficulty": "beginner"
          }
        ]
      },
      {
        "name": "questions",
        "gestures": [
          {
            "id": "comment",
            "name": "Comment",
            "difficulty": "intermediate"
          },
          {
            "id": "pourquoi",
            "name": "Pourquoi",
            "difficulty": "intermediate"
          }
        ]
      }
    ],
    "total": 150
  }
}
```

## Codes d'erreur

| Code HTTP | Message               | Description                                                      |
| --------- | --------------------- | ---------------------------------------------------------------- |
| 400       | Bad Request           | La requête est mal formée ou contient des données invalides      |
| 401       | Unauthorized          | L'authentification est requise ou a échoué                       |
| 403       | Forbidden             | L'utilisateur n'a pas les permissions nécessaires                |
| 404       | Not Found             | La ressource demandée n'existe pas                               |
| 422       | Unprocessable Entity  | La requête est bien formée mais contient des erreurs sémantiques |
| 429       | Too Many Requests     | Trop de requêtes dans un intervalle de temps donné               |
| 500       | Internal Server Error | Une erreur s'est produite sur le serveur                         |
| 503       | Service Unavailable   | Le service est temporairement indisponible                       |
