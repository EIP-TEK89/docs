---
sidebar_position: 4
title: AI FAQ
description: Frequently asked questions about TrioSigno's artificial intelligence features.
---

# AI FAQ

This section addresses frequently asked questions about the artificial intelligence components used in TrioSigno.

## AI Functionality

### How does sign recognition work in TrioSigno?

Sign recognition in TrioSigno uses a deep neural network specialized in computer vision. The process occurs in several stages:

1. **Video capture**: The application uses your device's camera to capture real-time images.
2. **Keypoint detection**: A pose detection model identifies 21 keypoints on each hand, as well as points on the face and body.
3. **Feature extraction**: The movements and positions of these points are analyzed to extract features specific to signs.
4. **Classification**: These features are sent to a classification model that identifies the performed sign from its database of known signs.
5. **User feedback**: The system provides feedback on the accuracy of the performed sign.

### What types of AI models are used in TrioSigno?

TrioSigno uses several complementary AI models:

- **MediaPipe Hands** for precise detection of hands and fingers
- **A convolutional neural network (CNN)** for static image analysis
- **A LSTM (Long Short-Term Memory) network** for analyzing movement sequences
- **A transformer model** for contextual understanding of complex signs
- **Reinforcement learning algorithms** to personalize the learning experience

### Can TrioSigno's AI recognize all French Sign Language signs?

Currently, TrioSigno's AI can recognize approximately 5,000 common signs and expressions in French Sign Language. This database is regularly enriched with new training data. However, as FSL is a rich and living language, some regional signs, idiomatic expressions, or very specific signs may not yet be recognized accurately. Our team continuously works on improving the model.

## Data and Privacy

### Are my videos recorded when I use sign recognition?

By default, TrioSigno does not store video streams captured during training sessions. Processing happens in real-time, and only the coordinates of keypoints (not the images themselves) are analyzed by the model.

If you enable the "Contribute to AI Improvement" option in the settings, some anonymized data from your sessions may be used to improve the models, but only after your explicit consent and with strict confidentiality guarantees.

### How is my learning data protected?

TrioSigno takes data protection very seriously:

- Primary processing of visual data happens locally on your device
- Data sent to servers is encrypted in transit
- No biometric data that could identify you is stored
- You can delete your learning data at any time in the settings
- Our detailed privacy policy is available in the "Legal Notices" section of the application

## Performance and Usage

### Why is sign recognition sometimes inaccurate?

Several factors can affect recognition accuracy:

- **Lighting**: Insufficient or uneven lighting can reduce hand visibility
- **Background**: A cluttered background or one with a lot of movement can disrupt detection
- **Camera position**: The camera must have a clear view of your hands and face
- **Execution speed**: Some signs must be performed at a particular speed
- **Personal variations**: Slight variations in sign execution are normal but can sometimes affect recognition

We recommend using the application in a well-lit environment, with a neutral background, and following the positioning advice given in the application.

### Does the application work without an Internet connection?

A reduced version of the recognition AI works offline after an initial download of the models (approximately 50 MB). This local version can recognize about 1,000 common signs. To access all features and complete recognition capabilities, an Internet connection is required.

### Does sign recognition consume a lot of battery?

Sign recognition intensively uses your device's processor and GPU, which can increase battery consumption. To optimize battery life:

- Use the "Energy Saving" mode in the application settings
- Limit recognition sessions to 20-30 minutes
- Plug in your device during extended training sessions
- Close background applications

## Training and Improvement

### How can I contribute to improving TrioSigno's AI?

You can contribute in several ways:

1. Enable the "Contribute to AI Improvement" option in the settings
2. Participate in regularly organized data collection campaigns
3. Report recognition errors via the "Report a Problem" button
4. Join the beta tester program to try new versions of the models

### Does the AI adapt to my way of signing?

Yes, with the "Personalized Learning" option enabled, the AI model gradually adapts to your signing specificities. This adaptation happens locally on your device and improves recognition accuracy over time. This feature is particularly useful for people with motor limitations or variations in their way of signing.

### How often are AI models updated?

The main models are updated quarterly with major improvements. Minor updates may be deployed more frequently to fix specific issues or add new signs. Updates are automatic and happen in the background when you are connected to a Wi-Fi network.
