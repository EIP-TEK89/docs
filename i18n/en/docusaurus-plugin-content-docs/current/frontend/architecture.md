---
sidebar_position: 2
---

# Frontend Architecture

## Technical Architecture

TrioSigno's frontend architecture is based on modern React development principles, emphasizing modularity, reusability, and code maintainability.

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                    Frontend Application                    │
├───────────┬───────────────┬──────────────┬────────────────┤
│           │               │              │                │
│   API     │  Components   │    Hooks     │    Context     │
│ Services  │               │              │      API       │
│           │               │              │                │
├───────────┼───────────────┼──────────────┼────────────────┤
│           │               │              │                │
│   HTTP    │    Pages      │    React     │     Axios      │
│  Clients  │               │   Routing    │  Interceptors  │
│           │               │              │                │
├───────────┴───────────────┴──────────────┴────────────────┤
│                                                           │
│                    Backend API (NestJS)                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## State Management

TrioSigno uses React Context API for global application state management. This approach offers several advantages:

- **Simplicity**: Built into React without external libraries
- **Flexibility**: Creation of contexts specific to each functional domain
- **Performance**: Optimization of re-renders via useMemo and useCallback
- **Maintainability**: State logic encapsulated in custom hooks

### Authentication Context Structure

```typescript
// authContext.ts
import { createContext } from "react";
import type { User } from "../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshToken: async () => "",
});

// authProvider.tsx
import type { ReactNode } from "react";
import { AuthContext } from "./authContext";
import { useAuthState } from "./hooks/useAuthState";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use the combined auth state hook
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};
```

## Component Organization

Components are organized according to their function and scope in the application:

1. **UI Components**: Reusable base components (buttons, inputs, cards)
2. **Functional Components**: Components specific to a feature (lessons, dictionary)
3. **Page Components**: Complete page implementations
4. **Layout Components**: Global application structure (Layout, Navbar, Footer)

### Routing Structure Example

```tsx
// Layout.tsx
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lessons" element={<LessonJourney />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/dictionary/:signId" element={<DictionaryDetail />} />
          <Route
            path="*"
            element={
              <div className="container-card">
                <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
                  404 Not Found
                </h1>
                <p className="mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <Link to="/" className="button-primary inline-block">
                  Go Home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
```

## Internationalization System (i18n)

The application uses i18next to manage internationalization:

```typescript
// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en";
import frTranslation from "./locales/fr";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

## API Services

API services are organized by functional domain and use Axios for HTTP requests:

```typescript
// apiClient.ts (excerpt)
import axios from "axios";
import { API_URL } from "../constants/routes";
import { isTokenExpired } from "../utils/tokenUtils";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to request headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Implement token refresh logic
    // ...
  }
);

export default apiClient;
```
