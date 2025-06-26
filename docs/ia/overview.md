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
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│  Caméra/Vidéo     │ ---> │  Détection des    │ ---> │  Extraction des   │
│                   │      │ mains (MediaPipe) │      │  points de repère │
│                   │      │                   │      │  (Mediapipe)      │
└───────────────────┘      └───────────────────┘      └─────────┬─────────┘
                                                                │
                                                                ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │  Prétraitement    │
│  Feedback à       │ <--- │  Classification   │ <--- │  des données      │
│  l'utilisateur    │      │  du geste         │      │  (Normalisation / │
│                   │      │                   │      │Précalcul vélocité)│
└───────────────────┘      └───────────────────┘      └───────────────────┘
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

Les modèles sont basé sur une architecture transformeur.
Avec une flexibilité sur les données d'entré, de sortie, le nombre de tête d'attention,
et de couches. Pour proposer des modèles et performant spécialisé sur seulement quelques signes
n'utilisant en entré que les information significative pour la reconnaissances des dit signes.
(Exemple: L'alphabet de LSF n'exige que l'usage des mains, les données d'entrée n'inclueront donc pas les données du visage et du corps pour réduire la complexité et la taille du modèle)

```python
TensorPair: TypeAlias = tuple[torch.Tensor, torch.Tensor]

@dataclass
class DataSamplesInfo:
    labels: list[str]
    label_map: dict[str, int]
    memory_frame: int
    active_gestures: ActiveGestures
    one_side: bool
    null_sample_id: int | None

    def __init__(
        self,
        labels: list[str],
        memory_frame: int,
        active_gestures: ActiveGestures = ALL_GESTURES,
        one_side: bool = False,
        null_sample_id: int | None = None,
    ):
        self.labels = labels
        self.memory_frame = memory_frame
        self.active_gestures = active_gestures
        self.label_map = {label: i for i,
                          label in enumerate(self.labels)}
        self.one_side = one_side
        self.null_sample_id = null_sample_id

    @classmethod
    def fromDict(cls, data: dict[str, object]) -> Self:
        assert "labels" in data, "Missing 'labels' field in DataSamplesInfo"
        assert "memory_frame" in data, "Missing 'memory_frame' field in DataSamplesInfo"
        assert isinstance(
            data["labels"], list), "Invalid 'labels' field in DataSamplesInfo"
        assert isinstance(
            data["memory_frame"], int), "Invalid 'memory_frame' field in DataSamplesInfo"
        labels: list[str] = data["labels"]
        tmp: Self = cls(
            labels=labels,
            memory_frame=data["memory_frame"],
        )
        if "active_gestures" in data and isinstance(data["active_gestures"], dict):
            active_gest_dict: dict[str, bool | None] = data["active_gestures"]
            tmp.active_gestures = ActiveGestures(**active_gest_dict)
        if "one_side" in data and isinstance(data["one_side"], bool):
            tmp.one_side = data["one_side"]
        if "null_sample_id" in data and isinstance(data["null_sample_id"], int):
            tmp.null_sample_id = data["null_sample_id"]
        return tmp

    def toDict(self) -> dict[str, object]:
        return {
            "labels": self.labels,
            "memory_frame": self.memory_frame,
            "active_gestures": self.active_gestures.toDict(),
            "label_map": self.label_map,
            "one_side": self.one_side,
            "null_sample_id": self.null_sample_id,
        }


@dataclass
class ModelInfo(DataSamplesInfo):
    name: str
    d_model: int
    num_heads: int
    num_layers: int
    ff_dim: int

    @classmethod
    def build(cls,
              info: DataSamplesInfo,
              name: str | None = None,
              d_model: int = 32,
              num_heads: int = 8,
              num_layers: int = 3,
              ff_dim: int | None = None
              ) -> Self:
        if name is None:
            name = f"model_{time.strftime('%d-%m-%Y_%H-%M-%S')}"
        name = name.replace("/", "").replace("\\", "")

        return cls(
            labels=info.labels,
            label_map=info.label_map,
            memory_frame=info.memory_frame,
            active_gestures=info.active_gestures,
            one_side=info.one_side,
            null_sample_id=info.null_sample_id,
            name=name,
            d_model=d_model,
            num_heads=num_heads,
            num_layers=num_layers,
            ff_dim=ff_dim if ff_dim is not None else d_model * 4
        )

    @override
    @classmethod
    def fromDict(cls,
                 data: dict[str, object]
                 ) -> Self:
        info: DataSamplesInfo = DataSamplesInfo.fromDict(data)
        assert "name" in data, "name must be in the dict"
        assert isinstance(data["name"], str), "name must be a str or None"

        assert "d_model" in data, "d_model must be in the dict"
        assert isinstance(data["d_model"], int), "d_model must be an int"

        assert "num_heads" in data, "num_heads must be in the dict"
        assert isinstance(data["num_heads"], int), "num_heads must be an int"

        assert "num_layers" in data, "num_layers must be in the dict"
        assert isinstance(data["num_layers"], int), "num_layers must be an int"

        assert "ff_dim" in data, "ff_dim must be in the dict"
        assert isinstance(data["ff_dim"], int), "ff_dim must be an int"

        return cls.build(info,
                         data["name"],
                         data["d_model"],
                         data["num_heads"],
                         data["num_layers"],
                         data["ff_dim"])

    @classmethod
    def fromJsonFile(cls,
                     file_path: str
                     ) -> Self:
        with open(file_path, 'r', encoding="utf-8") as f:
            return cls.fromDict(cast(dict[str, object], json.load(f)))

    @override
    def toDict(self
               ) -> dict[str, object]:
        _dict: dict[str, object] = super(ModelInfo, self).toDict()
        _dict["name"] = self.name
        _dict["d_model"] = self.d_model
        _dict["num_heads"] = self.num_heads
        _dict["num_layers"] = self.num_layers
        _dict["ff_dim"] = self.ff_dim
        return _dict

    def toJsonFile(self,
                   file_path: str,
                   indent: int = 4
                   ) -> None:
        with open(file_path, 'w', encoding="utf-8") as f:
            json.dump(self.toDict(), f, ensure_ascii=False, indent=indent)


class SignRecognizerTransformerLayer(nn.Module):
    def __init__(self, d_model: int, num_heads: int, ff_dim: int, dropout: float = 0.1):
        super().__init__()
        self.attention: nn.MultiheadAttention = nn.MultiheadAttention(
            d_model, num_heads, dropout=dropout)
        self.norm1: nn.LayerNorm = nn.LayerNorm(d_model)
        self.norm2: nn.LayerNorm = nn.LayerNorm(d_model)

        # Feed-Forward Network (FFN)
        self.ffn: nn.Sequential = nn.Sequential(
            nn.Linear(d_model, ff_dim),
            nn.ReLU(),
            nn.Linear(ff_dim, d_model)
        )
        self.dropout: nn.Dropout = nn.Dropout(dropout)

    @override
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Multi-Head Attention
        attn_output: torch.Tensor
        _: torch.Tensor
        attn_output, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_output)  # Ajout & Normalisation

        # Feed-Forward Network
        ffn_output: torch.Tensor = self.ffn(x)
        x = self.norm2(x + self.dropout(ffn_output))  # Ajout & Normalisation
        return x


class SignRecognizerTransformer(nn.Module):
    def __init__(self, info: ModelInfo, device: torch.device | None = None):
        """
        Args:
            "hidden" seq_len (int): Number of frame in the past the model will remember.

            "hidden" feature_dim (int): number of value we will give the model to recognize the sign (e.g: 3 for one hand point, 73 for a full hand and 146 for a two hand)

            d_model (int): How the many dimension will the model transform the input of size feature_dim

            num_heads (_type_): Number of of attention head in the model (to determine how many we need we must different quantity until finding a sweetspot, start with 8)

            num_layers (_type_): The longer the signs to recognize the more layer we need (start with 3)

            ff_dim (_type_): Usually d_model x 4, not sure what it does but apparently it help the model makes link between frame. (automatically set to d_model x 4 by default)

            "hidden" num_classes (_type_): Number of sign the model will recognize
        """
        super().__init__()

        self.device: torch.device = default_device(device)
        self.info: ModelInfo = info
        feature_dim = len(
            self.info.active_gestures.getActiveFields()) * FIELD_DIMENSION

        # On projette feature_dim → d_model
        self.embedding: nn.Linear = nn.Linear(feature_dim, self.info.d_model)
        self.pos_encoding: torch.Tensor = nn.Parameter(torch.randn(
            1, self.info.memory_frame, self.info.d_model))  # Encodage positionnel

        # Empilement des encodeurs
        self.encoder_layers: nn.ModuleList = nn.ModuleList([
            SignRecognizerTransformerLayer(self.info.d_model, self.info.num_heads, self.info.ff_dim) for _ in range(self.info.num_layers)
        ])

        # Couche finale de classification
        self.fc: nn.Linear = nn.Linear(
            self.info.d_model, len(self.info.labels))

        self.to(self.device)

    @classmethod
    def loadModelFromDir(cls, model_dir: str, device: torch.device | None = None) -> Self:
        json_files = glob.glob(f"{model_dir}/*.json")
        if len(json_files) == 0:
            raise FileNotFoundError(f"No .json file found in {model_dir}")
        info: ModelInfo = ModelInfo.fromJsonFile(json_files[0])
        print(info)
        cls = cls(info, device=device)

        pth_files = glob.glob(f"{model_dir}/*.pth")
        if len(pth_files) == 0:
            raise FileNotFoundError(f"No .pth file found in {model_dir}")
        cls.loadPthFile(pth_files[0])

        return cls

    def loadPthFile(self, model_path: str) -> Self:
        self.load_state_dict(torch.load(model_path, map_location=self.device))
        return self

    def saveModel(self, model_path: str | None = None):
        if model_path is None:
            model_path = self.info.name
        print(f"Saving model to {model_path}...", end="", flush=True)

        os.makedirs(model_path, exist_ok=True)
        full_name: str = f"{model_path}/{self.info.name}"
        torch.save(self.state_dict(), full_name + ".pth")
        self.info.toJsonFile(full_name + ".json")
        print("[DONE]")
        return model_path

    def getEmbeddings(self, x: torch.Tensor) -> torch.Tensor:
        """
        Return the embeddings of the input tensor

        Args:
            x (torch.Tensor): Input tensor of shape [batch_size, seq_len, num_features]

        Returns:
            torch.Tensor: Embeddings of shape [batch_size, d_model]
        """
        # Embedding + Positional Encoding
        x = self.embedding(x) + self.pos_encoding
        # Transformer attend [seq_len, batch_size, d_model]
        x = x.permute(1, 0, 2)

        for encoder in self.encoder_layers:
            x = encoder(x)

        return x.mean(dim=0)

    def classify(self, embeddings: torch.Tensor) -> torch.Tensor:
        """
        Classify the input embeddings using the final linear layer.
        Args:
            embeddings (torch.Tensor): Input embeddings of shape [batch_size, d_model]

        Returns:
            torch.Tensor: Output logits of shape [batch_size, num_classes]
        """
        return cast(torch.Tensor, self.fc(embeddings))

    def getLabelID(self, logits: torch.Tensor) -> list[int]:
        """
        Get the label id from the logits.
        Args:
            logits (torch.Tensor): Input logits of shape [batch_size, num_classes]

        Returns:
            list[int]: List of predicted label ids
        """
        return cast(list[int], torch.argmax(logits, dim=1).tolist())

    @override
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.classify(self.getEmbeddings(x))

    def predict(self, x: torch.Tensor) -> int:
        """
        Predict the label id for the input tensor.
        Args:
            x (torch.Tensor): Input tensor of shape [batch_size, seq_len, num_features]
        Returns:
            int: Predicted label id
        """
        with torch.no_grad():
            return self.getLabelID(self.forward(x))[0]
```

## Métriques de performance

Le modèle de reconnaissance atteint les performances suivantes :

- **Précision globale** : 98% sur l'ensemble de test
- **Précision pour les signes de base** : ~99.5%
- **Précision pour les signes complexes** : ~95%
- **Latence moyenne** : 0.1ms sur GPU, 1ms sur CPU
- **Taille du modèle** : ~200KB (modèle optimisé pour le déploiement)

## API de l'IA

L'IA est exposée via une API REST développée avec Flask
dont les endpoints sont accessible [ici](endpoints(deprecated).md)

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

## Intégration avec le frontend et le backend

L'IA s'intègre de manière transparente avec les autres composants de TrioSigno :

- **Frontend** : Capture des gestes via la caméra et affichage du feedback en temps réel
- **Backend** : Stockage des résultats d'analyse pour le suivi de progression
- **Système de gamification** : Attribution de points basée sur la précision de l'exécution des gestes
