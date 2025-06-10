---
sidebar_position: 1
---

# Vue d'ensemble de l'IA

## Introduction

Le composant IA de TrioSigno est responsable de la reconnaissance et de l'analyse des gestes en langue des signes française (LSF). Cette technologie permet aux utilisateurs de pratiquer leurs compétences en LSF et de recevoir un retour en temps réel sur leur exécution.

## Technologies principales

- **Python**: Langage principal pour le développement du modèle d'IA
- **TensorFlow/Keras**: Framework pour l'entraînement et l'inférence du modèle
- **MediaPipe**: Bibliothèque Google pour la détection des mains et des points de repère
- **OpenCV**: Traitement d'images et de vidéos en temps réel
- **Flask**: API légère pour servir le modèle
- **Docker**: Conteneurisation pour le déploiement

## Architecture du modèle

Le système de reconnaissance des signes de TrioSigno utilise une architecture à deux étapes :

1. **Détection des mains et extraction des points de repère** : Utilisation de MediaPipe pour identifier les mains dans l'image et extraire 21 points de repère 3D par main.

2. **Classification des gestes** : Un réseau de neurones profond entraîné pour classifier les séquences de points de repère en gestes LSF spécifiques.

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Caméra/Vidéo     │────▶│  Détection des    │────▶│  Extraction des   │
│                   │     │  mains (MediaPipe) │     │  points de repère │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └─────────┬─────────┘
                                                              │
                                                              ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Feedback à       │◀────│  Classification   │◀────│  Prétraitement    │
│  l'utilisateur    │     │  du geste         │     │  des données      │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

## Ensemble de données

Le modèle d'IA a été entraîné sur un ensemble de données composé de :

- Données publiques de la langue des signes française
- Ensemble de données propriétaire créé spécifiquement pour TrioSigno
- Données augmentées générées par diverses transformations

L'ensemble de données contient plus de 50 000 exemples couvrant :

- 500+ signes et expressions courantes en LSF
- Variations d'angle, d'éclairage et de morphologie des mains
- Différents contextes et arrière-plans

## Architecture du réseau neuronal

Le modèle utilise une architecture hybride combinant :

1. **Réseaux de neurones récurrents (LSTM)** : Pour capturer la séquence temporelle des mouvements.
2. **Réseaux de neurones convolutifs (CNN)** : Pour extraire des caractéristiques spatiales de haut niveau.
3. **Transformers** : Pour modéliser les relations entre les différents points de repère des mains.

```python
def create_model(num_classes, sequence_length, num_landmarks):
    # Entrée : séquence de points de repère des mains
    input_layer = Input(shape=(sequence_length, num_landmarks, 3))

    # Extraction de caractéristiques spatiales
    x = TimeDistributed(Conv1D(64, kernel_size=3, activation='relu'))(input_layer)
    x = TimeDistributed(MaxPooling1D(pool_size=2))(x)
    x = TimeDistributed(Conv1D(128, kernel_size=3, activation='relu'))(x)
    x = TimeDistributed(MaxPooling1D(pool_size=2))(x)

    # Extraction de caractéristiques temporelles
    x = TimeDistributed(Flatten())(x)
    x = LSTM(256, return_sequences=True)(x)
    x = LSTM(128)(x)

    # Classification
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.5)(x)
    output_layer = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=input_layer, outputs=output_layer)
    return model
```

## Métriques de performance

Le modèle de reconnaissance atteint les performances suivantes :

- **Précision globale** : 94.5% sur l'ensemble de test
- **Précision pour les signes de base** : 97.2%
- **Précision pour les signes complexes** : 89.8%
- **Latence moyenne** : 75ms sur GPU, 150ms sur CPU
- **Taille du modèle** : 45 MB (modèle optimisé pour le déploiement)

## API de l'IA

L'IA est exposée via une API REST développée avec Flask :

```
POST /api/analyze-gesture
Content-Type: application/json

{
  "landmarks": [...],  // Points de repère des mains en format MediaPipe
  "userId": "user123"  // Optionnel, pour le suivi de progression
}

Réponse:
{
  "gesture": "bonjour",
  "confidence": 0.95,
  "feedback": {
    "accuracy": "high",
    "suggestions": ["Maintenez le mouvement un peu plus longtemps"]
  }
}
```

## Déploiement

Le service d'IA est déployé dans un conteneur Docker, facilitant l'intégration avec le reste de l'infrastructure TrioSigno :

```yaml
# Extrait du docker-compose.yml
services:
  ai-service:
    build: ./ai
    restart: always
    ports:
      - "5000:5000"
    volumes:
      - ./ai/models:/app/models
    environment:
      - MODEL_PATH=/app/models/gesture_recognition_v2.h5
      - THRESHOLD=0.7
      - MAX_HISTORY=100
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G
```

## Amélioration continue

Le modèle d'IA de TrioSigno s'améliore continuellement grâce à :

1. **Apprentissage actif** : Identification des cas où le modèle est peu confiant pour cibler la collecte de données.
2. **Feedback utilisateur** : Intégration des retours des utilisateurs pour améliorer la précision.
3. **Réentraînement périodique** : Mise à jour du modèle avec de nouvelles données.
4. **Tests A/B** : Évaluation de différentes architectures de modèles en production.

## Intégration avec le frontend et le backend

L'IA s'intègre de manière transparente avec les autres composants de TrioSigno :

- **Frontend** : Capture des gestes via la caméra et affichage du feedback en temps réel
- **Backend** : Stockage des résultats d'analyse pour le suivi de progression
- **Système de gamification** : Attribution de points basée sur la précision de l'exécution des gestes
