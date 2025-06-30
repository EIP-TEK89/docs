---
sidebar_position: 2
---

# Architecture Frontend

## Architecture Technique

L'architecture frontend de TrioSigno est basée sur les principes de développement React modernes, en mettant l'accent sur la modularité, la réutilisabilité et la maintenabilité du code.

### Diagramme d'architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Application Frontend                   │
├───────────┬───────────────┬──────────────┬────────────────┤
│           │               │              │                │
│  Services │  Composants   │    Hooks     │    Context     │
│    API    │               │              │      API       │
│           │               │              │                │
├───────────┼───────────────┼──────────────┼────────────────┤
│           │               │              │                │
│  Clients  │    Pages      │   Routage    │  Intercepteurs │
│    HTTP   │               │    React     │     Axios      │
│           │               │              │                │
├───────────┴───────────────┴──────────────┴────────────────┤
│                                                           │
│                    Backend API (NestJS)                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Gestion de l'état

TrioSigno utilise React Context API pour la gestion de l'état global de l'application. Cette approche offre plusieurs avantages :

- **Simplicité** : Intégré à React sans bibliothèque externe
- **Flexibilité** : Création de contextes spécifiques à chaque domaine fonctionnel
- **Performance** : Optimisation des re-renders via useMemo et useCallback
- **Maintenabilité** : Logique d'état encapsulée dans des hooks personnalisés

### Structure du Context pour l'authentification

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

## Organisation des composants

Les composants sont organisés selon leur fonction et leur portée dans l'application :

1. **Composants UI** : Composants de base réutilisables (boutons, inputs, cards)
2. **Composants fonctionnels** : Composants spécifiques à une fonctionnalité (lessons, dictionnaire)
3. **Composants de page** : Implémentations de pages complètes
4. **Composants de mise en page** : Structure globale de l'application (Layout, Navbar, Footer)

### Exemple de structure de routage

```tsx
// Layout.tsx
import { Route, Routes, Link, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Home from "../pages/Home";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import Navigation from "../components/Navbar";
import Profile from "../pages/Profile";
import LessonJourney from "../pages/LessonJourney";
import LessonDetail from "../pages/LessonDetail";
import Dictionary from "../pages/Dictionary";
import DictionaryDetail from "../pages/DictionaryDetail";

function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    );
  }
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

## Système d'internationalisation (i18n)

L'application utilise i18next pour gérer l'internationalisation :

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

## Services API

Les services API sont organisés par domaine fonctionnel et utilisent Axios pour les requêtes HTTP :

```typescript
// apiClient.ts (extrait)
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

```

```
