---
sidebar_position: 5
title: FAQ Mobile
description: Questions fréquemment posées sur le mobile de l'application TrioSigno.
---

# FAQ mobile

Voici les réponses aux questions fréquemment posées concernant le mobile de TrioSigno.

## Architecture et Technologies

### Quelles technologies sont utilisées pour le mobile de TrioSigno ?

Le mobile de TrioSigno est construit avec les technologies suivantes :

- **React** et **Next.js** comme framework principal
- **TypeScript** pour le typage statique
- **Native CSS** pour le styling
- **React Context API** pour la gestion d'état
- **Reanimated 3** pour les animations
- **TensorFlow.js** pour l'exécution des modèles d'IA côté client
- **Jest** et **React Testing Library** pour les tests unitaires
- **Playwright** pour les tests end-to-end

### Comment est organisée l'architecture mobile ?

L'architecture mobile suit une structure modulaire :

- **app** : Composants de page correspondant aux routes de l'application
- **assets**: Assets utilisés in l'app
- **components** : Composants UI réutilisables organisés par domaine et fonctionnalité
- **services** : Services pour les appels API et la logique métier
- **types** : Définitions de types TypeScript
- **constants** : Valeurs constantes utilisées dans l'application
- **context** : Providers React Context pour la gestion d'état globale

### Comment est géré l'état dans l'application ?

L'état dans TrioSigno est géré à plusieurs niveaux :

1. **État local** : Pour les composants individuels, nous utilisons `useState`
2. **État global** : Pour l'état partagé entre plusieurs composants, nous utilisons React Context API
3. **État serveur** : Pour les données provenant du backend, nous utilisons React Query qui gère le cache, les requêtes et les mises à jour

Nous suivons une approche de "state colocation" où l'état est maintenu aussi près que possible de l'endroit où il est utilisé.

## Développement

### Comment configurer l'environnement de développement mobile ?

Pour configurer l'environnement de développement mobile :

1. Clonez le dépôt Git :

   ```bash
   git clone https://github.com:EIP-TEK89/trio-signo-mobile.git
   cd triosigno/client
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :

   - Copiez le fichier `.env.example` vers `.env.local`
   - Modifiez les valeurs selon votre configuration

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera disponible sur l'application expo.

### Comment ajouter un nouveau composant ?

Pour ajouter un nouveau composant :

1. Créez un nouveau dossier dans `components/` avec le nom du composant (utilisez PascalCase)
2. Créez les fichiers suivants dans ce dossier :
   - `index.tsx` : Le composant principal
   - `[ComponentName].module.css` : Styles spécifiques au composant (si nécessaire)
   - `[ComponentName].test.tsx` : Tests unitaires
   - `[ComponentName].stories.tsx` : Documentation Storybook (si applicable)

Exemple de structure pour un composant `Button` :

```
components/
  Button/
    index.tsx
    Button.module.css
    Button.test.tsx
    Button.stories.tsx
```

### Comment ajouter une nouvelle page ?

#### Ajouter une nouvelle page dans Expo Router (React Native)

Expo Router (avec le dossier `app/`) fonctionne comme Next.js: chaque fichier defini une route.

---

##### Create a **basic** page

**But: directement accessible via son chemin (par exemple: /about).

###### Étapes

1. Créer un fichier dans `app/app/about.tsx`→ correspond à `/about`.

2. Créer un composant :
```tsx
import { Text, View } from "react-native";

export default function AboutPage() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>About Page</Text>
    </View>
  );
}
```
3. Naviguer vers la page :

```tsx
import { Link } from "expo-router";

<Link href="/about">Go to About</Link>
```

##### Ajouter une nouvelle page dans **tabs**

Si vous utiliser la navigation par onglets avec Expo Router, la structure ressemble à celà:

```bash
app/
  (tabs)/
    index.tsx      // Home
    settings.tsx   // Settings
```
Chaque fichier dans (tabs)/ = un onglet.

###### Etape
1. Créer un fichier dans (tabs)/

```bash
app/(tabs)/profile.tsx
```

→ crée un onglet "Profile".

2. Créer un composant :

```tsx
import { Text, View } from "react-native";

export default function ProfileTab() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Tab</Text>
    </View>
  );
}
```

3. Déclarer l'onglet dans _layout.tsx :

```bash
app/(tabs)/_layout.tsx
```
```tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

### Comment gérer les traductions et l'internationalisation ?

TrioSigno utilise [next-i18next](https://github.com/isaachinman/next-i18next) pour gérer les traductions et l'internationalisation. Voici comment l'utiliser :

1. Les fichiers de traduction sont stockés dans le dossier `public/locales/[lang]/[namespace].json`
2. Utilisez le hook `useTranslation` pour accéder aux traductions dans les composants :

```tsx
import { useTranslation } from "next-i18next";

function MyComponent() {
  const { t } = useTranslation("common");

  return <h1>{t("welcome")}</h1>;
}
```

3. Pour ajouter une nouvelle langue :
   - Créez un nouveau dossier pour la langue dans `public/locales/`
   - Copiez les fichiers JSON de traduction d'une langue existante
   - Traduisez les valeurs dans les fichiers JSON
   - Ajoutez la langue à la configuration dans `next-i18next.config.js`

## Tests et Qualité de Code

### Comment exécuter les tests mobile ?

Pour exécuter les tests mobile :

1. Tests unitaires avec Jest :

   ```bash
   npm test
   ```

2. Tests unitaires en mode watch (pour le développement) :

   ```bash
   npm run test:watch
   ```

3. Tests end-to-end avec Playwright :

   ```bash
   npm run test:e2e
   ```

4. Vérification de la couverture de code :
   ```bash
   npm run test:coverage
   ```

### Comment déboguer le mobile ?

Pour déboguer le mobile de TrioSigno :

1. **Utiliser les outils de développement de Expo** :

   - Scabber le Qr code avec l'application expo mobile ou utiliser d'autres outils compatabiles avec expo comme android studio

2. **Déboguer avec les points d'arrêt** :

   - Ajoutez `debugger;` dans votre code JavaScript/TypeScript
   - Utilisez les points d'arrêt des DevTools dans l'onglet Sources
   - Utilisez l'extension React DevTools pour inspecter les composants React

3. **Utiliser les logs** :

   - Utilisez `console.log()`, `console.warn()` et `console.error()` pour afficher des informations dans la console
   - Pour la gestion d'état, ajoutez des logs dans les reducers et les effets

4. **Mode développement** :
   - Assurez-vous que l'application est en mode développement pour des messages d'erreur plus détaillés

### Comment suivre les bonnes pratiques de développement mobile ?

Pour suivre les bonnes pratiques dans le développement mobile de TrioSigno :

1. **Qualité du code** :

   - Suivez les règles ESLint et Prettier configurées dans le projet
   - Exécutez `npm run lint` et `npm run format` avant de committer
   - Visez une couverture de tests d'au moins 80%

2. **Performance** :

   - Utilisez React.memo pour les composants qui se rendent fréquemment
   - Optimisez les dépendances des hooks useEffect et useCallback
   - Utilisez l'analyse de bundle avec `npm run analyze` pour identifier les gros modules

3. **Accessibilité** :

   - Utilisez des éléments sémantiques HTML appropriés
   - Assurez-vous que tous les éléments interactifs sont accessibles au clavier
   - Fournissez des alternatives textuelles pour les images et contenus visuels
   - Testez avec les outils d'accessibilité comme axe

4. **Revue de code** :
   - Demandez des revues de code pour toutes les pull requests
   - Utilisez la fonctionnalité de commentaires de GitHub pour discuter des changements spécifiques
   - Vérifiez que les tests CI passent avant de fusionner

## Fonctionnalités Spécifiques

### Comment fonctionne l'intégration avec la caméra pour la reconnaissance de signes ?

L'intégration avec la caméra pour la reconnaissance de signes fonctionne comme suit :

1. **Accès à la caméra** : Nous utilisons l'API `useCameraPermission()` pour accéder à la caméra de l'utilisateur
2. **Capture de flux vidéo** : Le flux vidéo est capturé et affiché dans un élément `<Camera>`
3. **Traitement d'image** : Les images du flux vidéo sont extraites à intervalles réguliers (généralement 30fps)
4. **Détection de points clés** : TensorFlow.js est utilisé avec le modèle MediaPipe Hands pour détecter les points clés des mains
5. **Classification des signes** : Un second modèle TensorFlow.js classifie les positions des mains pour identifier les signes
6. **Retour à l'utilisateur** : Le résultat de la classification est affiché à l'utilisateur avec un feedback visuel

```tsx
function App() {
  const device = useCameraDevice('back')
  const { hasPermission } = useCameraPermission()

  if (!hasPermission) return <PermissionsPage />
  if (device == null) return <NoCameraDeviceError />
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  )
}
```

### Comment fonctionne le système de gamification ?

Le système de gamification de TrioSigno est implémenté comme suit :

1. **Points d'expérience (XP)** : Les utilisateurs gagnent des XP en complétant des leçons, des exercices et en pratiquant régulièrement
2. **Niveaux** : Les utilisateurs montent de niveau en accumulant des XP, avec des paliers progressifs
3. **Badges** : Des badges sont débloqués pour des accomplissements spécifiques (compléter une série de leçons, pratiquer plusieurs jours consécutifs, etc.)
4. **Tableaux de classement** : Les utilisateurs peuvent se comparer à d'autres apprenants
5. **Défis quotidiens** : Des défis sont proposés chaque jour pour encourager la pratique régulière

Côté mobile, nous utilisons :

- Des animations pour célébrer les réussites
- Des notifications pour informer des badges débloqués et niveaux atteints
- Des visualisations de progression pour motiver les utilisateurs
- Des rappels personnalisés basés sur les habitudes d'apprentissage

### Comment gérer le mode hors ligne ?

Le mode hors ligne dans TrioSigno est géré grâce à plusieurs technologies :

1. **Service Workers** : Nous utilisons les service workers pour mettre en cache les ressources statiques et certaines données dynamiques
2. **IndexedDB** : Les données de l'utilisateur et du contenu sont stockées localement avec IndexedDB
3. **Synchronisation en arrière-plan** : Lorsque la connexion est rétablie, les données sont synchronisées avec le serveur

```tsx
// Exemple de hook pour détecter l'état de la connexion
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

Pour utiliser les fonctionnalités hors ligne :

1. Les leçons déjà consultées sont automatiquement mises en cache
2. Le dictionnaire de signes peut être téléchargé pour un accès hors ligne
3. Les progrès réalisés hors ligne sont enregistrés localement puis synchronisés
4. Une notification informe l'utilisateur lorsqu'il passe en mode hors ligne

## Performances et Optimisation

### Comment optimiser les performances du mobile ?

Pour optimiser les performances du mobile de TrioSigno, nous utilisons plusieurs techniques :

1. **Chargement différé (lazy loading)** :

   - Les composants non critiques sont chargés à la demande avec `React.lazy` et `Suspense`
   - Les images utilisent le chargement paresseux avec l'attribut `loading="lazy"`
   - Les modèles d'IA sont chargés uniquement lorsqu'ils sont nécessaires

2. **Optimisation des images** :

   - Utilisation du format WebP avec fallback pour les navigateurs plus anciens
   - Redimensionnement des images selon les besoins de l'affichage
   - Utilisation du composant `next/image` pour l'optimisation automatique

3. **Mise en cache** :

   - Mise en cache des requêtes API avec React Query
   - Utilisation des headers de cache HTTP appropriés
   - Stratégies de cache optimisées dans les service workers

4. **Pré-chargement (preloading)** :

   - Pré-chargement des ressources critiques
   - Pré-chargement des données de la page suivante probable

5. **Optimisation du rendu** :
   - Utilisation de `React.memo` pour les composants coûteux
   - Virtualisation des listes longues avec `react-window`
   - Optimisation des hooks avec useMemo et useCallback

### Comment est gérée l'accessibilité dans TrioSigno ?

L'accessibilité dans TrioSigno est prise en compte à plusieurs niveaux :

1. **Structure sémantique** :

   - Structure de titres logique et hiérarchique
   - Points de repère ARIA pour la navigation

2. **Clavier et focus** :

   - Navigation complète au clavier
   - Indication visuelle claire du focus
   - Ordres de tabulation logiques
   - Raccourcis clavier pour les actions fréquentes

3. **Contenu non textuel** :

   - Attributs `alt` descriptifs pour les images
   - Sous-titres pour les vidéos
   - Transcriptions pour le contenu audio
   - Descriptions des signes en texte

4. **Contraste et lisibilité** :

   - Respect des ratios de contraste WCAG 2.1 AA
   - Option de thème à contraste élevé
   - Taille de texte ajustable
   - Pas d'information transmise uniquement par la couleur

5. **Compatibilité avec les technologies d'assistance** :
   - Attributs ARIA appropriés
   - Tests avec lecteurs d'écran (NVDA, JAWS, VoiceOver)
   - Support des gestes d'accessibilité sur mobile

Nous effectuons des audits d'accessibilité réguliers et incluons des personnes en situation de handicap dans nos tests utilisateurs.

### Comment le mobile communique-t-il avec le backend ?

La communication entre le mobile et le backend de TrioSigno se fait principalement via une API REST, avec les caractéristiques suivantes :

1. **Client HTTP** : Nous utilisons Axios comme client HTTP, configuré avec des intercepteurs pour la gestion des erreurs et des tokens

2. **Services API** : Les appels API sont organisés dans des services par domaine fonctionnel :

   ```tsx
   // services/api/lessonService.ts
   import axios from "../axios";
   import { Lesson, LessonProgress } from "@/types";

   export const lessonService = {
     async getAllLessons() {
       const response = await axios.get<Lesson[]>("/lessons");
       return response.data;
     },

     async getLessonById(id: string) {
       const response = await axios.get<Lesson>(`/lessons/${id}`);
       return response.data;
     },

     async updateProgress(lessonId: string, progress: LessonProgress) {
       const response = await axios.post<{ success: boolean }>(
         `/lessons/${lessonId}/progress`,
         progress
       );
       return response.data;
     },
   };
   ```

3. **Gestion d'état** : React Query est utilisé pour gérer l'état des données du serveur :

   ```tsx
   import { useQuery, useMutation, useQueryClient } from "react-query";
   import { lessonService } from "@/services/api/lessonService";

   // Hook pour charger une leçon
   export function useLesson(id: string) {
     return useQuery(["lesson", id], () => lessonService.getLessonById(id));
   }

   // Hook pour mettre à jour la progression
   export function useUpdateProgress() {
     const queryClient = useQueryClient();

     return useMutation(
       ({ lessonId, progress }) =>
         lessonService.updateProgress(lessonId, progress),
       {
         onSuccess: (_, { lessonId }) => {
           // Invalider et recharger les données après mise à jour
           queryClient.invalidateQueries(["lesson", lessonId]);
           queryClient.invalidateQueries("userProgress");
         },
       }
     );
   }
   ```

4. **Authentification** : Les requêtes authentifiées incluent un token JWT dans l'en-tête Authorization :

   ```tsx
   // services/axios.ts
   import axios from "axios";
   import { getToken } from "@/utils/auth";

   const instance = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
     timeout: 10000,
     headers: {
       "Content-Type": "application/json",
     },
   });

   // Ajouter le token à chaque requête
   instance.interceptors.request.use((config) => {
     const token = getToken();
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   // Gérer les erreurs globalement
   instance.interceptors.response.use(
     (response) => response,
     (error) => {
       // Gérer les erreurs 401 (non autorisé)
       if (error.response && error.response.status === 401) {
         // Rediriger vers la page de connexion ou rafraîchir le token
       }
       return Promise.reject(error);
     }
   );

   export default instance;
   ```

5. **WebSockets** : Pour les fonctionnalités en temps réel (comme les tableaux de classement ou les sessions d'apprentissage en groupe), nous utilisons Socket.io.
