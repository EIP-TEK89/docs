Voici la traduction française complète de ton fichier Markdown :

---

> Le backend IA sera bientôt fusionné avec le backend principal, ceux-ci seront donc prochainement mis hors service.

# API Backend IA de Trio-Signo

Ce document décrit en détail comment utiliser l’API pour communiquer avec la partie backend IA de Trio-Signo.

# Informations

Cette API suit la convention REST.

Toutes les requêtes et réponses sont au format JSON. Aucun autre format n’est pris en charge pour le moment.

# En-têtes et Authentification

Le système d’en-têtes et d’authentification n’a pas encore été défini.
Il n’est donc pas nécessaire d’ajouter quoi que ce soit pour accéder aux points de terminaison (endpoints) de cette API.

<br/><br/><br/><br/>

# Appels API

## GET

- [Ping](#get---ping)
- [Télécharger un modèle de reconnaissance](#get---get-sign-recognizer-model)

## POST

- [Reconnaître une lettre depuis une image](#post---get-alphabet)
- [Reconnaître une lettre depuis des points 3D](#post---get-alphabet2)

## DELETE

- [Fin de session de reconnaissance](#delete---get-alphabet-end)

<br/><br/><br/><br/>

# GET - Ping

**URL :** `{root_url}/ping`

## Description

Point de terminaison simple permettant de vérifier si le serveur est actif.

## Requête

### En-têtes

_Aucun_

### Corps

_Aucun_

## Réponse

### 200

```json
{
  "message": "pong"
}
```

## Exemple

```sh
curl -X GET "{root_url}/ping"
```

<br/><br/>

# GET - Télécharger un modèle de reconnaissance

**URL :** `{root_url}/get-sign_recognizer-model/{model-name}`

## Description

Permet de télécharger un modèle.

## Requête

### En-têtes

_Aucun_

### Corps

_Aucun_

## Réponse

### 200

Fichier zip contenant :

```
model.zip/
    |-> model.onnx # Poids du modèle
    '-> model.json # Informations du modèle
```

### 404

```json
{
  "message": "Aucun modèle trouvé"
}
```

## Exemple

```sh
curl -X GET "{root_url}/get-sign_recognizer-model/alphabet"
```

<br/><br/>

# POST - Reconnaître une lettre depuis une image

**URL :** `{root_url}/get-alphabet`

## Description

Reçoit une image et retourne la lettre qu'elle représente en LSF (Langue des Signes Française), ou `null` si aucune lettre n’est reconnue.
**IMPORTANT :** ce point de terminaison conserve les images précédentes pour permettre la reconnaissance sur une séquence (vidéo). Il est donc **obligatoire** d’appeler le point [get-alphabet-end](#delete---get-alphabet-end) une fois la session terminée.

## Requête

### En-têtes

```json
{
  "Content-Type": "multipart/form-data"
}
```

### Corps

Format **form-data** avec les paramètres suivants :

| Clé  | Type                   | Description      |
| ---- | ---------------------- | ---------------- |
| file | Fichier (.jpg ou .png) | Image à analyser |

## Réponse

### 200

```json
{
  "message": "A"
}
```

Ou si aucune main n’est détectée :

```json
{
  "message": null
}
```

### 400

> Si le corps ou ses valeurs sont incorrects.

```json
{
  "message": "Message d’erreur"
}
```

## Exemple

```sh
curl -X POST "{root_url}/get-alphabet" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@B.jpg"
```

<br/><br/>

# POST - Reconnaître une lettre depuis des points 3D

**URL :** `{root_url}/get-alphabet2`

## Description

Attend les points 3D générés par le modèle `MediaPipe HandLandmarker`.

**IMPORTANT :** ce point de terminaison garde les points précédents en mémoire pour reconnaître des signes en mouvement. Il faut **obligatoirement** appeler [get-alphabet-end](#delete---get-alphabet-end) pour clore la session.

## Requête

### En-têtes

```json
{
  "Content-Type": "application/json"
}
```

### Corps

Exemple de format JSON : chaque champ peut être un tableau de 3 flottants ou `null`.

```json
{
  "l_hand_position": [
    0.8998612761497498, 0.47253280878067017, -3.850680911909876e-7
  ],
  "l_wrist": [0.00806891918182373, 0.07892453670501709, 0.015518805012106895],
  "l_thumb_cmc": [
    -0.0202289130538702, 0.060800254344940186, 0.0035137240774929523
  ],
  "l_thumb_mcp": [
    -0.046166982501745224, 0.043004438281059265, 0.010012363083660603
  ],
  "l_thumb_ip": [
    -0.07757717370986938, 0.025659386068582535, 0.016046881675720215
  ],
  "l_thumb_tip": [
    -0.10497097671031952, 0.009791262447834015, 0.03523814305663109
  ],
  "l_index_mcp": [
    -0.02864322066307068, -0.0031441221944987774, 0.006585570052266121
  ],
  "l_index_pip": [
    -0.03236301615834236, -0.010864194482564926, -0.013661608099937439
  ],
  "l_index_dip": [
    -0.030568867921829224, -0.0006146137602627277, -0.015350844711065292
  ],
  "l_index_tip": [
    -0.02689363621175289, 0.00804886780679226, -0.0029758629389107227
  ],
  "l_middle_mcp": [
    -0.00560837984085083, -0.004359850659966469, 0.0058035170659422874
  ],
  "l_middle_pip": [
    -0.0106519078835845, -0.01468548271805048, -0.02581506222486496
  ],
  "l_middle_dip": [
    -0.01916278339922428, 0.010006235912442207, -0.033204495906829834
  ],
  "l_middle_tip": [
    -0.0093716811388731, 0.011128885671496391, -0.004174341913312674
  ],
  "l_ring_mcp": [
    0.01868732087314129, -0.0011302419006824493, -0.0037493272684514523
  ],
  "l_ring_pip": [
    0.005036872811615467, -0.0063772136345505714, -0.027042007073760033
  ],
  "l_ring_dip": [
    -0.0022493936121463776, 0.013661570847034454, -0.03136857599020004
  ],
  "l_ring_tip": [
    0.01045067235827446, 0.018018584698438644, -0.0101028922945261
  ],
  "l_pinky_mcp": [
    0.03163111209869385, 0.010812398977577686, -0.009892250411212444
  ],
  "l_pinky_pip": [
    0.026150468736886978, 0.0005377912893891335, -0.028811253607273102
  ],
  "l_pinky_dip": [
    0.01693340763449669, 0.010664019733667374, -0.034755412489175797
  ],
  "l_pinky_tip": [
    0.020904961973428726, 0.021468045189976692, -0.027099382132291794
  ],
  "r_hand_position": null,
  "r_wrist": null,
  "r_thumb_cmc": null,
  "r_thumb_mcp": null,
  "r_thumb_ip": null,
  "r_thumb_tip": null,
  "r_index_mcp": null,
  "r_index_pip": null,
  "r_index_dip": null,
  "r_index_tip": null,
  "r_middle_mcp": null,
  "r_middle_pip": null,
  "r_middle_dip": null,
  "r_middle_tip": null,
  "r_ring_mcp": null,
  "r_ring_pip": null,
  "r_ring_dip": null,
  "r_ring_tip": null,
  "r_pinky_mcp": null,
  "r_pinky_pip": null,
  "r_pinky_dip": null,
  "r_pinky_tip": null,
  "l_hand_velocity": null,
  "r_hand_velocity": null
}
```

## Réponse

### 200

```json
{
  "message": "A"
}
```

Ou si aucune main n’est détectée :

```json
{
  "message": null
}
```

### 400

> Si le corps ou ses valeurs sont incorrects.

```json
{
  "message": "Message d’erreur"
}
```

## Exemple

```sh
curl -X POST "{root_url}/get-alphabet2" \
  -H "Content-Type: application/json" \
  -d "votre JSON"
```

<br/><br/>

# DELETE - Fin de session de reconnaissance

**URL :** `{root_url}/get-alphabet-end`

## Description

Nettoie l’historique des images/points après l’utilisation de l’endpoint [get-alphabet](#post---get-alphabet) ou [get-alphabet2](#post---get-alphabet2).

## Requête

### En-têtes

```json
{
  "Content-Type": "application/json"
}
```

### Corps

_Aucun_

## Réponse

### 200

```json
{
  "message": "Historique supprimé"
}
```

### 400

> Si la requête est invalide (par exemple, mauvaise IP).

```json
{
  "message": "Adresse IP invalide"
}
```

## Exemple

```sh
curl -X DELETE "{root_url}/get-alphabet" \
  -H "Content-Type: multipart/form-data"
```
