# Intro
> We consider you have **installed** the library and **made it work** before following **any** of these instructions, if not consult this [README](https://github.com/EIP-TEK89/triosignolib/tree/main)

This documentation describe *for now*, how to use the most important feature of this lib, if you need to use more advanced feature please refer to in code documentation.

# Sign recognizer quick implementation
The following code is a minimal and straight forward implementation of the sign recognizer class.<br/>
It only recognizes the sign, no video feedback, no overdraw of the body tracking.
```ts
import { SignRecognizer } from "triosigno-lib";
import { OnnxRunnerWeb, MediapipeRunnerWeb } from "triosigno-web"; // Add this line ONLY if you use the lib for a web app
import { OnnxRunnerMobile, MediapipeRunnerMobile } from "triosigno-mobile"; // Add this line ONLY if you use the lib for a mobile app

const signRecognizer = new SignRecognizer(new OnnxRunnerWeb("model/url"), MediapipeRunnerWeb()); // Add this line ONLY if you use the lib for a web app
const signRecognizer = new SignRecognizer(new OnnxRunnerMobile("model/url"), MediapipeRunnerMobile()); // Add this line ONLY if you use the lib for a mobile app

function recognize_sign() {
  // We create a non-blocking loop to not just fetch first frame and freeze.
  const frame: HTMLVideoElement | null; // The SignRecognizer class takes a video stream and attempt to recognize a sign on it.
  if (frame) {
    const result: ModelsPredictions = signRecognizer.predict(frame); // Process the image and find the sign on it, if any.
    // Process the data the way you want.
  }
  requestAnimationFrame(recognize_sign); // Loop the function
}
recognize_sign()
```

Additionally, if you wish to render on a `canva` the image with the tracking of the user body parts you can implement this. (Make sure to adapt this code to your framework)
```ts
import { drawHandLandmarkerResult, SignRecognizer } from "triosigno-lib";
import { OnnxRunnerWeb, MediapipeRunnerWeb } from "triosigno-web"; // Add this line ONLY if you use the lib for a web app
import { OnnxRunnerMobile, MediapipeRunnerMobile } from "triosigno-mobile"; // Add this line ONLY if you use the lib for a mobile app

const signRecognizer = new SignRecognizer(new OnnxRunnerWeb("model/url"), MediapipeRunnerWeb()); // Add this line ONLY if you use the lib for a web app
const signRecognizer = new SignRecognizer(new OnnxRunnerMobile("model/url"), MediapipeRunnerMobile()); // Add this line ONLY if you use the lib for a mobile app


// Make sure you have a canvas html object defined in your html code.
const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement

function recognize_sign() {
  // We create a non-blocking loop to not just fetch first frame and freeze.
  const frame: HTMLVideoElement | null; // The SignRecognizer class takes a video stream and attempt to recognize a sign on it.
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frame) {
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height); // Draw you video stream input on the canva.
      const result: ModelsPredictions = signRecognizer.predict(frame); // Process the image and find the sign on it, if any.
      if (result && result.landmarks && result.landmarks.hand) {
        drawHandLandmarkerResult(ctx, result.landmarks.hand); // Draw on the canvas the tracking of the hands
      }
    }
  }
  requestAnimationFrame(recognize_sign); // Loop the function
}
recognize_sign()
```
> Somewhere in your HTML code:
```html
<canvas id="canvas" width="640" height="480"></canvas>
```

# ModelsPrediction Interface
This what the class method `predict()` of `SignRecognizer` returns, here's a small explanation of what it contains so can use fully the model predictions.
```ts
interface ModelsPredictions {
  signId: number; // Where you can get the ID of the recognized sign
  signLabel: string; // Where you can get the name of the recognized sign
  landmarks: LandmarkData; // Contain coordinates of every points of the hands/body/face found on the screen
}
```
These fields are `null` if they couldn't find the element they were tracking on the frame.<br/>
> e.g: If no hand are visible on the frame hand will be `null`
```ts
interface LandmarkData {
  hand: HandLandmarkerResult | null;
  body: BodyLandmarkerResult | null; // /!\ Not yet implemented
  face: FaceLandmarkerResult | null; // /!\ Not yet implemented
}
```
