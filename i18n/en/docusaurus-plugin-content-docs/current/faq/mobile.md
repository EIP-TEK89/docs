---
sidebar_position: 5
title: Mobile FAQ
description: Frequently asked questions about the TrioSigno application mobile.
---

# Mobile FAQ

Here are answers to frequently asked questions about TrioSigno's mobile.

## Architecture and Technologies

### What technologies are used for TrioSigno's mobile?

TrioSigno's mobile is built with the following technologies:

- **React** and **Next.js** as the main framework
- **TypeScript** for static typing
- **Nailwind CSS** Module for styling
- **React Context API** for state management
- **Reanimated 3** for animations
- **TensorFlow.js** for client-side AI model execution
- **Jest** and **React Testing Library** for unit testing
- **Playwright** for end-to-end testing

### How is the mobile architecture organized?

The mobile architecture follows a modular structure:

- **app**: Page components corresponding to application routes
- **assets**: Assets used in the app
- **components**: Reusable UI components organized by domain and functionality
- **services**: Services for API calls and business logic
- **types**: TypeScript type definitions
- **constants**: Constant values used in the application
- **context**: React Context providers for global state management

### How is state managed in the application?

State in TrioSigno is managed at multiple levels:

1. **Local state**: For individual components, we use `useState` 
2. **Global state**: For state shared between multiple components, we use React Context API
3. **Server state**: For data from the backend, we use React Query which manages caching, querying, and updates

We follow a "state colocation" approach where state is maintained as close as possible to where it's used.

## Development

### How do I set up the mobile development environment?

To set up the mobile development environment:

1. Clone the Git repository:

   ```bash
   git clone https://github.com:EIP-TEK89/trio-signo-mobile.git
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

The application will be available on the expo application.

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

### How do I run mobile tests?

To run mobile tests:

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

### How do I debug the mobile?

To debug TrioSigno's mobile:

1. **The Expo developer tools**:

   - Scan the Qr code with the expo mobile app or use other tools compatible with expo like android studio

2. **Debug with breakpoints**:

   - Add `debugger;` in your JavaScript/TypeScript code
   - Use breakpoints in DevTools in the Sources tab
   - Use the React DevTools extension to inspect React components

3. **Use logs**:

   - Use `console.log()`, `console.warn()`, and `console.error()` to display information in the console
   - For state management, add logs in reducers and effects

4. **Development mode**:
   - Make sure the application is in development mode for more detailed error messages

### How do I follow mobile development best practices?

To follow best practices in TrioSigno's mobile development:

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

1. **Camera access**: We use the `useCameraPermission()` API to access the user's camera
2. **Video stream capture**: The video stream is captured and displayed in a `<Camera>` element
3. **Image processing**: Images from the video stream are extracted at regular intervals (typically 30fps)
4. **Keypoint detection**: TensorFlow.js is used with the MediaPipe Hands model to detect hand keypoints
5. **Sign classification**: A second TensorFlow.js model classifies hand positions to identify signs
6. **User feedback**: The classification result is displayed to the user with visual feedback

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

### How does the gamification system work?

TrioSigno's gamification system is implemented as follows:

1. **Experience points (XP)**: Users earn XP by completing lessons, exercises, and practicing regularly
2. **Levels**: Users level up by accumulating XP, with progressive thresholds
3. **Badges**: Badges are unlocked for specific achievements (completing a series of lessons, practicing for several consecutive days, etc.)
4. **Leaderboards**: Users can compare themselves to other learners
5. **Daily challenges**: Challenges are offered each day to encourage regular practice

On the mobile, we use:

- Animations to celebrate achievements
- Notifications to inform about unlocked badges and levels reached
- Progress visualizations to motivate users
- Personalized reminders based on learning habits

### How is offline mode handled?

Offline mode in TrioSigno is managed using several technologies:

1. **Service Workers**: We use service workers to cache static resources and certain dynamic data
2. **IndexedDB**: User data and content are stored locally with IndexedDB
3. **Background synchronization**: When the connection is restored, data is synchronized with the server

To use offline features:

1. Previously viewed lessons are automatically cached
2. The sign dictionary can be downloaded for offline access
3. Progress made offline is recorded locally then synchronized
4. A notification informs the user when switching to offline mode

## Performance and Optimization

### How do I optimize mobile performance?

To optimize TrioSigno's mobile performance, we use several techniques:

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
   - Testing with screen readers (TalkBack, VoiceOver)
   - Support for accessibility gestures on mobile

We conduct regular accessibility audits and include people with disabilities in our user testing.

### How does the mobile communicate with the backend?

Communication between TrioSigno's mobile and backend happens primarily via a REST API, with the following characteristics:

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
