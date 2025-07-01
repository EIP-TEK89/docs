# Introduction triosignolib

Cette documentation décrit *pour l’instant* comment utiliser la fonctionnalité la plus importante de cette bibliothèque. Si vous avez besoin de fonctionnalités plus avancées, veuillez vous référer à la documentation dans le code.

## Installation

Clonez ce dépôt à la racine de votre espace de code.

Puis exécutez :

```bash
npm install ./triosignolib/core
```

Ensuite, selon votre plateforme :

> Pour navigateur web

```bash
npm install ./triosignolib/web
```

> Pour mobile (Android/iOS)

```bash
npm install ./triosignolib/mobile
```

## Dépannage avec Vite

Si vous avez une erreur Vite indiquant qu’il ne peut pas importer le chemin de la librairie, ajoutez ceci dans votre `vite.config.ts` :

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, 'triosignolib')
      ]
    }
  }
});
```

---

Si dans votre navigateur vous obtenez l’une des erreurs suivantes :

* *GET [http://localhost/node\_modules/.vite/deps/ort-wasm-simd-threaded.jsep.wasm](http://localhost/node_modules/.vite/deps/ort-wasm-simd-threaded.jsep.wasm) 404 not found*
* *wasm streaming compile failed: TypeError: WebAssembly: Response has unsupported MIME type 'text/html' expected 'application/wasm'*

Ajoutez ceci dans votre `vite.config.ts` :

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['onnxruntime-web'], // Garantit la bonne gestion du WASM
  },
});
```

---

## Dépannage EXPO GO

> Rien pour l’instant

# Implémentation rapide du SignRecognizer

Le code suivant est une implémentation minimale et directe de la classe `SignRecognizer`.<br/>
Elle reconnaît uniquement le signe : pas de retour vidéo, ni de superposition du suivi du corps.

```ts
import { SignRecognizer } from "triosigno-lib";
import { OnnxRunnerWeb, MediapipeRunnerWeb } from "triosigno-web"; // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app web
import { OnnxRunnerMobile, MediapipeRunnerMobile } from "triosigno-mobile"; // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app mobile

const signRecognizer = new SignRecognizer(new OnnxRunnerWeb("model/url"), MediapipeRunnerWeb()); // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app web
const signRecognizer = new SignRecognizer(new OnnxRunnerMobile("model/url"), MediapipeRunnerMobile()); // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app mobile

function recognize_sign() {
  // On crée une boucle non bloquante pour ne pas juste capturer la première frame et figer.
  const frame: HTMLVideoElement | null; // La classe SignRecognizer prend un flux vidéo et tente de reconnaître un signe dessus.
  if (frame) {
    const result: ModelsPredictions = signRecognizer.predict(frame); // Traite l’image et trouve le signe s’il y en a un.
    // Traitez les données comme vous le souhaitez.
  }
  requestAnimationFrame(recognize_sign); // Boucle la fonction
}
recognize_sign()
```

---

De plus, si vous souhaitez afficher sur un `canvas` l’image avec le suivi des parties du corps de l’utilisateur, vous pouvez implémenter ceci. (Assurez-vous d’adapter ce code à votre framework)

```ts
import { drawHandLandmarkerResult, SignRecognizer } from "triosigno-lib";
import { OnnxRunnerWeb, MediapipeRunnerWeb } from "triosigno-web"; // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app web
import { OnnxRunnerMobile, MediapipeRunnerMobile } from "triosigno-mobile"; // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app mobile

const signRecognizer = new SignRecognizer(new OnnxRunnerWeb("model/url"), MediapipeRunnerWeb()); // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app web
const signRecognizer = new SignRecognizer(new OnnxRunnerMobile("model/url"), MediapipeRunnerMobile()); // Ajoutez cette ligne UNIQUEMENT si vous utilisez la lib dans une app mobile

// Assurez-vous d’avoir un élément HTML canvas défini dans votre code HTML.
const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement

function recognize_sign() {
  // On crée une boucle non bloquante pour ne pas juste capturer la première frame et figer.
  const frame: HTMLVideoElement | null; // La classe SignRecognizer prend un flux vidéo et tente de reconnaître un signe dessus.
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frame) {
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height); // Dessine votre flux vidéo en entrée sur le canvas.
      const result: ModelsPredictions = signRecognizer.predict(frame); // Traite l’image et trouve le signe s’il y en a un.
      if (result && result.landmarks && result.landmarks.hand) {
        drawHandLandmarkerResult(ctx, result.landmarks.hand); // Dessine sur le canvas le suivi des mains
      }
    }
  }
  requestAnimationFrame(recognize_sign); // Boucle la fonction
}
recognize_sign()
```

> Quelque part dans votre code HTML :

```html
<canvas id="canvas" width="640" height="480"></canvas>
```

---

# Interface ModelsPredictions

Voici ce que retourne la méthode `predict()` de la classe `SignRecognizer`, avec une petite explication pour que vous puissiez utiliser pleinement les prédictions du modèle.

```ts
interface ModelsPredictions {
  signId: number; // Contient l’ID du signe reconnu
  signLabel: string; // Contient le nom du signe reconnu
  landmarks: LandmarkData; // Contient les coordonnées de tous les points des mains/corps/visage détectés à l’écran
}
```

Ces champs sont `null` s’ils n’ont pas pu trouver l’élément qu’ils suivaient sur la frame.<br/>

> Exemple : si aucune main n’est visible sur la frame, `hand` sera `null`.

```ts
interface LandmarkData {
  hand: HandLandmarkerResult | null;
  body: BodyLandmarkerResult | null; // /!\ Pas encore implémenté
  face: FaceLandmarkerResult | null; // /!\ Pas encore implémenté
}
```
