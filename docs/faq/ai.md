---
sidebar_position: 4
title: FAQ IA
description: Questions fréquemment posées sur les fonctionnalités d'intelligence artificielle de TrioSigno.
---

# FAQ sur l'Intelligence Artificielle

Cette section aborde les questions fréquentes concernant les composants d'intelligence artificielle utilisés dans TrioSigno.

## Fonctionnement de l'IA

### Comment fonctionne la reconnaissance de signes dans TrioSigno ?

La reconnaissance de signes dans TrioSigno utilise un réseau de neurones profond spécialisé dans la vision par ordinateur. Le processus se déroule en plusieurs étapes :

1. **Capture vidéo** : L'application utilise la caméra de votre appareil pour capturer des images en temps réel.
2. **Détection des points clés** : Un modèle de détection de posture identifie 21 points clés sur chaque main, ainsi que des points du visage et du corps.
3. **Extraction des caractéristiques** : Les mouvements et positions de ces points sont analysés pour extraire des caractéristiques spécifiques aux signes.
4. **Classification** : Ces caractéristiques sont envoyées à un modèle de classification qui identifie le signe effectué parmi sa base de données de signes connus.
5. **Retour utilisateur** : Le système fournit un retour sur la précision du signe effectué.

### Quels types de modèles d'IA sont utilisés dans TrioSigno ?

TrioSigno utilise plusieurs modèles d'IA complémentaires :

- **MediaPipe Hands** pour la détection précise des mains et des doigts
- **Un réseau de neurones convolutif (CNN)** pour l'analyse des images statiques
- **Un réseau LSTM (Long Short-Term Memory)** pour analyser les séquences de mouvements
- **Un modèle de transformateur** pour la compréhension contextuelle des signes complexes
- **Des algorithmes d'apprentissage par renforcement** pour personnaliser l'expérience d'apprentissage

### L'IA de TrioSigno peut-elle reconnaître tous les signes de la LSF ?

Actuellement, l'IA de TrioSigno peut reconnaître environ 5 000 signes et expressions courantes en LSF. Cette base de données s'enrichit régulièrement grâce à de nouvelles données d'entraînement. Cependant, la LSF étant une langue vivante et riche, certains signes régionaux, expressions idiomatiques ou signes très spécifiques peuvent ne pas être encore reconnus avec précision. Notre équipe travaille continuellement à l'amélioration du modèle.

## Données et confidentialité

### Mes vidéos sont-elles enregistrées lorsque j'utilise la reconnaissance de signes ?

Par défaut, TrioSigno ne stocke pas les flux vidéo capturés pendant les sessions d'entraînement. Le traitement se fait en temps réel et seules les coordonnées des points clés (et non les images elles-mêmes) sont analysées par le modèle.

Si vous activez l'option "Contribuer à l'amélioration de l'IA" dans les paramètres, certaines données anonymisées de vos sessions peuvent être utilisées pour améliorer les modèles, mais uniquement après votre consentement explicite et avec des garanties de confidentialité strictes.

### Comment sont protégées mes données d'apprentissage ?

TrioSigno prend la protection des données très au sérieux :

- Le traitement principal des données visuelles se fait localement sur votre appareil
- Les données envoyées aux serveurs sont chiffrées en transit
- Aucune donnée biométrique permettant de vous identifier n'est stockée
- Vous pouvez à tout moment supprimer vos données d'apprentissage dans les paramètres
- Notre politique de confidentialité détaillée est disponible dans la section "Mentions légales" de l'application

## Performance et utilisation

### Pourquoi la reconnaissance de signes est-elle parfois imprécise ?

Plusieurs facteurs peuvent affecter la précision de la reconnaissance :

- **Éclairage** : Un éclairage insuffisant ou irrégulier peut réduire la visibilité des mains
- **Arrière-plan** : Un arrière-plan trop chargé ou avec beaucoup de mouvement peut perturber la détection
- **Position de la caméra** : La caméra doit avoir une vue dégagée de vos mains et de votre visage
- **Vitesse d'exécution** : Certains signes doivent être effectués à une vitesse particulière
- **Variations personnelles** : De légères variations dans l'exécution des signes sont normales mais peuvent parfois affecter la reconnaissance

Nous recommandons d'utiliser l'application dans un environnement bien éclairé, avec un arrière-plan neutre, et de suivre les conseils de positionnement donnés dans l'application.

### L'application fonctionne-t-elle sans connexion Internet ?

Une version réduite de l'IA de reconnaissance fonctionne en mode hors-ligne après un premier téléchargement des modèles (environ 50 Mo). Cette version locale peut reconnaître environ 1 000 signes courants. Pour accéder à l'ensemble des fonctionnalités et à la reconnaissance complète, une connexion Internet est nécessaire.

### La reconnaissance de signes consomme-t-elle beaucoup de batterie ?

La reconnaissance de signes utilise intensivement le processeur et le GPU de votre appareil, ce qui peut augmenter la consommation de batterie. Pour optimiser l'autonomie :

- Utilisez le mode "Économie d'énergie" dans les paramètres de l'application
- Limitez les sessions de reconnaissance à 20-30 minutes
- Branchez votre appareil lors des sessions d'entraînement prolongées
- Fermez les applications en arrière-plan

## Entraînement et amélioration

### Comment puis-je contribuer à améliorer l'IA de TrioSigno ?

Vous pouvez contribuer de plusieurs façons :

1. Activez l'option "Contribuer à l'amélioration de l'IA" dans les paramètres
2. Participez aux campagnes de collecte de données organisées régulièrement
3. Signalez les erreurs de reconnaissance via le bouton "Signaler un problème"
4. Participez au programme bêta-testeurs pour essayer les nouvelles versions des modèles

### L'IA s'adapte-t-elle à ma façon de signer ?

Oui, avec l'option "Apprentissage personnalisé" activée, le modèle d'IA s'adapte progressivement à vos spécificités de signes. Cette adaptation se fait localement sur votre appareil et améliore la précision de reconnaissance au fil du temps. Cette fonctionnalité est particulièrement utile pour les personnes ayant des limitations motrices ou des variations dans leur façon de signer.

### À quelle fréquence les modèles d'IA sont-ils mis à jour ?

Les modèles principaux sont mis à jour trimestriellement avec des améliorations majeures. Des mises à jour mineures peuvent être déployées plus fréquemment pour corriger des problèmes spécifiques ou ajouter de nouveaux signes. Les mises à jour sont automatiques et se déroulent en arrière-plan lorsque vous êtes connecté à un réseau Wi-Fi.
