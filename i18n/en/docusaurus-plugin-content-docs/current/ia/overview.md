---
sidebar_position: 1
---

# AI Overview

## Introduction

The AI component of TrioSigno is responsible for recognizing and analyzing gestures in French Sign Language (LSF). This technology allows users to practice their LSF skills and receive real-time feedback on their performance.

## Core Technologies

* **Python**: Main language for AI model development
* **TensorFlow/Keras**: Framework for training and inference
* **MediaPipe**: Google library for hand and landmark detection
* **OpenCV**: Real-time image and video processing
* **Flask**: Lightweight API to serve the model
* **Docker**: Containerization for deployment

## Model Architecture

TrioSigno’s sign recognition system uses a two-stage architecture:

1. **Hand Detection and Landmark Extraction**: MediaPipe is used to detect hands in the image and extract 21 3D landmarks per hand.

2. **Gesture Classification**: A deep neural network is trained to classify landmark sequences into specific LSF gestures.

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │  Landmark         │
│  Camera / Video   │ ---> │  Hand Detection   │ ---> │  Extraction       │
│                   │      │  (MediaPipe)      │      │  (MediaPipe)      │
└───────────────────┘      └───────────────────┘      └─────────┬─────────┘
                                                                │
                                                                ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │  Preprocessing    │
│  User Feedback    │ <--- │  Gesture          │ <--- │  (Normalization / │
│                   │      │  Classification   │      │  Velocity Calc.)  │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

## Dataset

The AI model was trained on a dataset composed of:

* Public French Sign Language datasets
* A proprietary dataset created specifically for TrioSigno
* Augmented data generated using various transformations

The dataset contains over 50,000 samples covering:

* 500+ common LSF signs and expressions
* Variations in hand angles, lighting, and morphology
* Diverse contexts and backgrounds

## Neural Network Architecture

The models are based on a transformer architecture.
They support flexibility in input/output structure, number of attention heads, and layers, enabling specialized lightweight models for small gesture sets.

For example, the French Sign language alphabet only requires hand input—so face and body data are excluded to reduce model size and complexity.

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

## Performance Metrics

The gesture recognition model achieves the following:

* **Overall accuracy**: 98% on the test set
* **Basic sign accuracy**: \~99.5%
* **Complex sign accuracy**: \~95%
* **Average latency**: 0.1ms on GPU, 1ms on CPU
* **Model size**: \~200KB (optimized for deployment)

## AI API

The AI is exposed through a REST API built with Flask.
Endpoints are available [here](endpoints%28deprecated%29.md).

## Deployment

The AI service is deployed via a Docker container, making integration with the rest of the TrioSigno infrastructure easy:

```yaml
# docker-compose.yml excerpt
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

## Continuous Improvement

The TrioSigno AI model continuously improves through:

1. **Active Learning**: Detecting low-confidence predictions to guide targeted data collection
2. **User Feedback**: Integrating real-world feedback to improve accuracy
3. **Periodic Retraining**: Updating the model with new samples

## Integration with Frontend and Backend

The AI integrates seamlessly with other TrioSigno components:

* **Frontend**: Captures gestures via the camera and displays real-time feedback
* **Backend**: Stores analysis results for tracking user progress
* **Gamification system**: Awards points based on gesture accuracy
