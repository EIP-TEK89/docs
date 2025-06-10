---
sidebar_position: 2
title: Frontend FAQ
description: Frequently asked questions about the TrioSigno application frontend.
---

# Frontend FAQ

Here are answers to frequently asked questions about TrioSigno's frontend.

## Architecture and Technologies

### What technologies are used for TrioSigno's frontend?

TrioSigno's frontend is built with the following technologies:

- **React** and **Next.js** as the main framework
- **TypeScript** for static typing
- **Tailwind CSS** and **CSS Modules** for styling
- **React Context API** and **React Query** for state management
- **Framer Motion** for animations
- **TensorFlow.js** for client-side AI model execution
- **Jest** and **React Testing Library** for unit testing
- **Playwright** for end-to-end testing

### How is the frontend architecture organized?

The frontend architecture follows a modular structure:

- **Pages**: Page components corresponding to application routes
- **Components**: Reusable UI components organized by domain and functionality
- **Hooks**: Custom hooks for reusable logic
- **Services**: Services for API calls and business logic
- **Utils**: Utility functions
- **Types**: TypeScript type definitions
- **Styles**: Global styles and themes
- **Constants**: Constant values used in the application
- **Context**: React Context providers for global state management

### How is state managed in the application?

State in TrioSigno is managed at multiple levels:

1. **Local state**: For individual components, we use `useState` and `useReducer`
2. **Global state**: For state shared between multiple components, we use React Context API
3. **Server state**: For data from the backend, we use React Query which manages caching, querying, and updates

We follow a "state colocation" approach where state is maintained as close as possible to where it's used.

## Development

### How do I set up the frontend development environment?

To set up the frontend development environment:

1. Clone the Git repository:

   ```bash
   git clone https://github.com/triosigno/triosigno.git
   cd triosigno/client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy the `.env.example` file to `.env.local`
   - Modify the values according to your configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000.

### How do I add a new component?

To add a new component:

1. Create a new folder in `components/` with the component name (use PascalCase)
2. Create the following files in this folder:
   - `index.tsx`: The main component
   - `[ComponentName].module.css`: Component-specific styles (if needed)
   - `[ComponentName].test.tsx`: Unit tests
   - `[ComponentName].stories.tsx`: Storybook documentation (if applicable)

Example structure for a `Button` component:

```
components/
  Button/
    index.tsx
    Button.module.css
    Button.test.tsx
    Button.stories.tsx
```

### How do I add a new page?

To add a new page in Next.js:

1. Create a new file in the `pages/` folder with the path corresponding to the desired URL
2. Import the necessary components and create the page component
3. Export the component as a default export

Example for a user profile page (`pages/users/profile.tsx`):

```tsx
import { GetServerSideProps } from "next";
import { useUser } from "@/hooks/useUser";
import { UserProfile } from "@/components/UserProfile";
import { ProtectedLayout } from "@/components/Layout/ProtectedLayout";

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedLayout>
      <h1>User Profile</h1>
      {user && <UserProfile user={user} />}
    </ProtectedLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side logic if needed
  return {
    props: {}, // These props will be passed to the page component
  };
};
```

### How are translations and internationalization handled?

TrioSigno uses [next-i18next](https://github.com/isaachinman/next-i18next) to handle translations and internationalization. Here's how to use it:

1. Translation files are stored in the `public/locales/[lang]/[namespace].json` folder
2. Use the `useTranslation` hook to access translations in components:

```tsx
import { useTranslation } from "next-i18next";

function MyComponent() {
  const { t } = useTranslation("common");

  return <h1>{t("welcome")}</h1>;
}
```

3. To add a new language:
   - Create a new folder for the language in `public/locales/`
   - Copy the JSON translation files from an existing language
   - Translate the values in the JSON files
   - Add the language to the configuration in `next-i18next.config.js`

## Testing and Code Quality

### How do I run frontend tests?

To run frontend tests:

1. Unit tests with Jest:

   ```bash
   npm test
   ```

2. Unit tests in watch mode (for development):

   ```bash
   npm run test:watch
   ```

3. End-to-end tests with Playwright:

   ```bash
   npm run test:e2e
   ```

4. Code coverage check:
   ```bash
   npm run test:coverage
   ```

### How do I debug the frontend?

To debug TrioSigno's frontend:

1. **Use browser developer tools**:

   - Open your browser's DevTools (F12 or Ctrl+Shift+I)
   - Use the Console tab to see errors and logs
   - Use the Network tab to inspect network requests
   - Use the Elements tab to inspect the DOM

2. **Debug with breakpoints**:

   - Add `debugger;` in your JavaScript/TypeScript code
   - Use breakpoints in DevTools in the Sources tab
   - Use the React DevTools extension to inspect React components

3. **Use logs**:

   - Use `console.log()`, `console.warn()`, and `console.error()` to display information in the console
   - For state management, add logs in reducers and effects

4. **Development mode**:
   - Make sure the application is in development mode for more detailed error messages

### How do I follow frontend development best practices?

To follow best practices in TrioSigno's frontend development:

1. **Code quality**:

   - Follow the ESLint and Prettier rules configured in the project
   - Run `npm run lint` and `npm run format` before committing
   - Aim for at least 80% test coverage

2. **Performance**:

   - Use React.memo for frequently rendering components
   - Optimize useEffect and useCallback hook dependencies
   - Use bundle analysis with `npm run analyze` to identify large modules

3. **Accessibility**:

   - Use appropriate semantic HTML elements
   - Ensure all interactive elements are keyboard accessible
   - Provide text alternatives for images and visual content
   - Test with accessibility tools like axe

4. **Code review**:
   - Request code reviews for all pull requests
   - Use GitHub's comment feature to discuss specific changes
   - Verify that CI tests pass before merging

## Specific Features

### How does the camera integration for sign recognition work?

The camera integration for sign recognition works as follows:

1. **Camera access**: We use the `MediaDevices.getUserMedia()` API to access the user's camera
2. **Video stream capture**: The video stream is captured and displayed in a `<video>` element
3. **Image processing**: Images from the video stream are extracted at regular intervals (typically 30fps)
4. **Keypoint detection**: TensorFlow.js is used with the MediaPipe Hands model to detect hand keypoints
5. **Sign classification**: A second TensorFlow.js model classifies hand positions to identify signs
6. **User feedback**: The classification result is displayed to the user with visual feedback

```tsx
// Simplified example of camera integration
import { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

function SignRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prediction, setPrediction] = useState<string>("");

  useEffect(() => {
    let handposeModel: handpose.HandPose;
    let signModel: tf.LayersModel;

    async function setupCamera() {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      videoRef.current.srcObject = stream;
      return new Promise<void>((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          videoRef.current!.play();
          resolve();
        };
      });
    }

    async function loadModels() {
      handposeModel = await handpose.load();
      signModel = await tf.loadLayersModel(
        "/models/sign_classification/model.json"
      );
    }

    async function detectHands() {
      if (!videoRef.current || !handposeModel || !signModel) return;

      const hands = await handposeModel.estimateHands(videoRef.current);

      if (hands.length > 0) {
        // Prepare data for classification
        const landmarks = hands[0].landmarks.flat();
        const tensor = tf.tensor([landmarks]);

        // Classify the sign
        const prediction = await signModel.predict(tensor);
        const signIndex = tf.argMax(prediction as tf.Tensor, 1).dataSync()[0];

        // Convert index to sign name (simplified example)
        const signNames = ["hello", "thank you", "yes", "no"];
        setPrediction(signNames[signIndex]);

        tensor.dispose();
      }

      // Continue detection
      requestAnimationFrame(detectHands);
    }

    (async function init() {
      await setupCamera();
      await loadModels();
      detectHands();
    })();

    return () => {
      // Cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: 640, height: 480, transform: "scaleX(-1)" }}
      />
      <div>Detected sign: {prediction || "None"}</div>
    </div>
  );
}
```

### How does the gamification system work?

TrioSigno's gamification system is implemented as follows:

1. **Experience points (XP)**: Users earn XP by completing lessons, exercises, and practicing regularly
2. **Levels**: Users level up by accumulating XP, with progressive thresholds
3. **Badges**: Badges are unlocked for specific achievements (completing a series of lessons, practicing for several consecutive days, etc.)
4. **Leaderboards**: Users can compare themselves to other learners
5. **Daily challenges**: Challenges are offered each day to encourage regular practice

On the frontend, we use:

- Animations to celebrate achievements
- Notifications to inform about unlocked badges and levels reached
- Progress visualizations to motivate users
- Personalized reminders based on learning habits

### How is offline mode handled?

Offline mode in TrioSigno is managed using several technologies:

1. **Service Workers**: We use service workers to cache static resources and certain dynamic data
2. **IndexedDB**: User data and content are stored locally with IndexedDB
3. **Background synchronization**: When the connection is restored, data is synchronized with the server

```tsx
// Example hook to detect connection status
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

To use offline features:

1. Previously viewed lessons are automatically cached
2. The sign dictionary can be downloaded for offline access
3. Progress made offline is recorded locally then synchronized
4. A notification informs the user when switching to offline mode

## Performance and Optimization

### How do I optimize frontend performance?

To optimize TrioSigno's frontend performance, we use several techniques:

1. **Lazy loading**:

   - Non-critical components are loaded on demand with `React.lazy` and `Suspense`
   - Images use lazy loading with the `loading="lazy"` attribute
   - AI models are loaded only when needed

2. **Image optimization**:

   - Use of WebP format with fallback for older browsers
   - Resizing images according to display needs
   - Use of the `next/image` component for automatic optimization

3. **Caching**:

   - Caching API requests with React Query
   - Using appropriate HTTP cache headers
   - Optimized caching strategies in service workers

4. **Preloading**:

   - Preloading critical resources
   - Preloading data for the likely next page

5. **Rendering optimization**:
   - Using `React.memo` for expensive components
   - Virtualizing long lists with `react-window`
   - Optimizing hooks with useMemo and useCallback

### How is accessibility handled in TrioSigno?

Accessibility in TrioSigno is addressed at several levels:

1. **Semantic structure**:

   - Appropriate use of HTML elements (`<nav>`, `<main>`, `<section>`, etc.)
   - Logical and hierarchical heading structure
   - ARIA landmarks for navigation

2. **Keyboard and focus**:

   - Complete keyboard navigation
   - Clear visual focus indication
   - Logical tab orders
   - Keyboard shortcuts for frequent actions

3. **Non-text content**:

   - Descriptive `alt` attributes for images
   - Captions for videos
   - Transcripts for audio content
   - Text descriptions of signs

4. **Contrast and readability**:

   - Compliance with WCAG 2.1 AA contrast ratios
   - High contrast theme option
   - Adjustable text size
   - No information conveyed solely by color

5. **Compatibility with assistive technologies**:
   - Appropriate ARIA attributes
   - Testing with screen readers (NVDA, JAWS, VoiceOver)
   - Support for accessibility gestures on mobile

We conduct regular accessibility audits and include people with disabilities in our user testing.

### How does the frontend communicate with the backend?

Communication between TrioSigno's frontend and backend happens primarily via a REST API, with the following characteristics:

1. **HTTP client**: We use Axios as the HTTP client, configured with interceptors for error handling and tokens

2. **API services**: API calls are organized in services by functional domain:

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

3. **State management**: React Query is used to manage server data state:

   ```tsx
   import { useQuery, useMutation, useQueryClient } from "react-query";
   import { lessonService } from "@/services/api/lessonService";

   // Hook to load a lesson
   export function useLesson(id: string) {
     return useQuery(["lesson", id], () => lessonService.getLessonById(id));
   }

   // Hook to update progress
   export function useUpdateProgress() {
     const queryClient = useQueryClient();

     return useMutation(
       ({
         lessonId,
         progress,
       }: {
         lessonId: string;
         progress: LessonProgress;
       }) => lessonService.updateProgress(lessonId, progress),
       {
         onSuccess: (data, variables) => {
           // Invalidate queries that might be affected by this update
           queryClient.invalidateQueries(["lesson", variables.lessonId]);
           queryClient.invalidateQueries("userProgress");
         },
       }
     );
   }
   ```
