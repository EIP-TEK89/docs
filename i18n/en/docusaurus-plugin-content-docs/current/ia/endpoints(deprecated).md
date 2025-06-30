> The AI backend will soon be merged with the main backend, these will soon be out of service

# Trio-Signo AI Backend API

The following document will describe thoroughly how to use the API to communicate
with the AI back-end part of Trio-Signo.

# Information

This API follow the REST convention.

Every request and response are in JSON format. No other format is supported yet.

# Header and Authentication

The header and authentication system has not been defined yet,
hence there's no need to do anything to access to any endpoint of this API.

<br/>
<br/>
<br/>
<br/>

# API Calls

## GET

- [Ping](#get---ping)
- [Get Sign Recognizer Model](#get---get-sign-recognizer-model)

## POST

- [Get Alphabet](#post---get-alphabet)
- [Get Alphabet2](#post---get-alphabet2)

## DELETE

- [Get Alphabet END](#delete---get-alphabet-end)

<br/>
<br/>
<br/>
<br/>

# GET - Ping

**URL:** `{root_url}/ping`

## Description

Simple endpoint that allow you to check if the server is up

## Request

### Header

_None_

### Body

_None_

## Response

### 200

```json
{
  "message": "pong"
}
```

## Example

```sh
curl -X GET "{root_url}/ping"
```

<br/>
<br/>

# GET - Get Sign Recognizer Model

**URL:** `{root_url}/get-sign_recognizer-model/{model-name}`

## Description

Allow you to download a model

## Request

### Header

_None_

### Body

_None_

## Response

### 200

Array buffer of zip file containing

```
model.zip/
    |-> model.onnx # Model weights
    '-> model.json # Model info
```

### 404

```json
{
  "message": "No model found"
}
```

## Example

```sh
curl -X GET "{root_url}/get-sign_recognizer-model/alphabet" \
```

<br/>
<br/>

# POST - Get Alphabet

**URL:** `{root_url}/get-alphabet`

## Description

Gets an image and return the letter it represent in LSF (French Sign Language) or nothing if it's not a letter.
**IMPORTANT** this endpoint remembers previous image sent in case you want to send a video streaming. Therefore **you must** call [get-alphabet-end](#delete---get-alphabet-end) endpoint when finishing using this endpoint.

## Request

### Header

You must set in your request headers the following values:

```json
{
  "Content-Type": "multipart/form-data"
}
```

### Body

The request body should be in the **form-data** format and include the following parameters:

| Key  | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| file | File | The image file to be processed. (in .jpg or .png format) |

## Response

### 200

```json
{
  "message": "A"
}
```

Or in case no hand is found:

```json
{
  "message": null
}
```

### 400

> When the body or its values are incorrect.

```json
{
  "message": "Error message"
}
```

## Example

```sh
curl -X POST "{root_url}/get-alphabet" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@B.jpg"
```

<br/>
<br/>

# POST - Get Alphabet 2

**URL:** `{root_url}/get-alphabet2`

## Description

Expects the points the mediapipe handlandmarker models returns

**IMPORTANT** this endpoint remembers previous points to be able to recognize signs that moves. Therefore **you must** call [get-alphabet-end](#delete---get-alphabet-end) endpoint when finishing using this endpoint.

## Request

### Header

You must set in your request headers the following values:

```json
{
  "Content-Type": "application/json"
}
```

### Body

Example of format, each field can either be an array of 3 floats or `null`

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

## Response

### 200

```json
{
  "message": "A"
}
```

Or in case no hand is found:

```json
{
  "message": null
}
```

### 400

> When the body or its values are incorrect.

```json
{
  "message": "Error message"
}
```

## Example

```sh
curl -X POST "{root_url}/get-alphabet2" \
  -H "Content-Type: application/json" \
  -B "your json data"
```

<br/>
<br/>

# DELETE - Get Alphabet END

**URL:** `{root_url}/get-alphabet-end`

## Description

Cleanup image history after using [get-alphabet](get-alphabet.md) endpoint.

## Request

### Header

You must set in your request headers the following values:

```json
{
  "Content-Type": "application/json"
}
```

### Body

_None_

## Response

### 200

```json
{
  "message": "Sample history deleted"
}
```

### 400

> When the body or its values are incorrect.

```json
{
  "message": "Invalid IP address"
}
```

## Example

```sh
curl -X DELETE "{root_url}/get-alphabet" \
  -H "Content-Type: multipart/form-data"
```
