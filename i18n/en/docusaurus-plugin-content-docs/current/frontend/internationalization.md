---
sidebar_position: 3
---

# Internationalization (i18n)

## Introduction

TrioSigno supports internationalization thanks to the i18next library, allowing the application to be used in multiple languages. Currently, the application is available in French (default language) and English.

## Technologies Used

- [i18next](https://www.i18next.com/): Internationalization framework for JavaScript
- [react-i18next](https://react.i18next.com/): Integration of i18next for React
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector): Automatic browser language detection

## File Structure

```
src/
  i18n/
    i18n.ts                 # Main i18n configuration
    locales/
      en.ts                 # English translations
      fr.ts                 # French translations
  components/
    LanguageSwitcher.tsx    # Component to change language
    LanguageDropdown.tsx    # Dropdown component to change language
    HomeLanguageDropdown.tsx # Variant for the home page
```

## i18next Configuration

The i18n configuration file defines the available languages and detection options:

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

## Usage in Components

To use translations in a React component, use the `useTranslation` hook:

```tsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("my.translation.key")}</h1>
      <p>{t("another.key")}</p>
    </div>
  );
};
```

## Language Switching

The application offers several components for changing language:

### 1. LanguageSwitcher

Simple component with buttons to change language:

````tsx
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
```tsx
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage("fr")}
        className={i18n.language === "fr" ? "active" : ""}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage("en")}
        className={i18n.language === "en" ? "active" : ""}
      >
        EN
      </button>
    </div>
  );
};
````

### 2. LanguageDropdown

Language dropdown selector used in the Profile page:

```tsx
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageDropdown = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      {/* Dropdown implementation */}
    </div>
  );
};
```

## Best Practices

1. **Translation Organization**: Structure translation files by functional domain for easier maintenance
2. **Key Naming**: Use a consistent naming system for translation keys (e.g., `domain.feature.element`)
3. **Default Values**: Always provide a default translation to avoid missing texts
4. **Pluralization**: Use i18next pluralization features to correctly handle numbers
5. **Variables**: Use variables in translations for dynamic elements

## Example Translation File

```typescript
// en.ts
export default {
  common: {
    welcome: "Welcome to TrioSigno",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    profile: "Profile",
    settings: "Settings",
  },
  lessons: {
    startLesson: "Start lesson",
    continueLesson: "Continue lesson",
    completed: "Completed",
    progress: "Progress",
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
  },
  profile: {
    languagePreference: "Language preference",
    changePassword: "Change password",
    deleteAccount: "Delete account",
  },
};
```

```

```
