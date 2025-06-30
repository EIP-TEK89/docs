---
sidebar_position: 3
---

# Internationalisation (i18n)

## Introduction

TrioSigno prend en charge l'internationalisation grâce à la bibliothèque i18next, permettant à l'application d'être utilisée en plusieurs langues. Actuellement, l'application est disponible en français (langue par défaut) et en anglais.

## Technologies utilisées

- [i18next](https://www.i18next.com/) : Framework d'internationalisation pour JavaScript
- [react-i18next](https://react.i18next.com/) : Intégration de i18next pour React
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) : Détection automatique de la langue du navigateur

## Structure des fichiers

```
src/
  i18n/
    i18n.ts                 # Configuration principale de i18n
    locales/
      en.ts                 # Traductions en anglais
      fr.ts                 # Traductions en français
  components/
    LanguageSwitcher.tsx    # Composant pour changer de langue
    LanguageDropdown.tsx    # Composant dropdown pour changer de langue
    HomeLanguageDropdown.tsx # Variante pour la page d'accueil
```

## Configuration i18next

Le fichier de configuration i18n définit les langues disponibles et les options de détection :

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

## Utilisation dans les composants

Pour utiliser les traductions dans un composant React, on utilise le hook `useTranslation` :

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

## Changement de langue

L'application propose plusieurs composants pour changer de langue :

### 1. LanguageSwitcher

Composant simple avec des boutons pour changer de langue :

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
```

### 2. LanguageDropdown

Sélecteur de langue en dropdown utilisé dans la page Profil :

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

## Bonnes pratiques

1. **Organisation des traductions** : Structurer les fichiers de traduction par domaine fonctionnel pour faciliter la maintenance
2. **Nommage des clés** : Utiliser un système de nommage cohérent pour les clés de traduction (ex: `domain.feature.element`)
3. **Valeurs par défaut** : Toujours fournir une traduction par défaut pour éviter les textes manquants
4. **Pluralisation** : Utiliser les fonctionnalités de pluralisation de i18next pour gérer correctement les nombres
5. **Variables** : Utiliser des variables dans les traductions pour les éléments dynamiques

## Exemple de fichier de traduction

```typescript
// fr.ts
export default {
  common: {
    welcome: "Bienvenue sur TrioSigno",
    login: "Se connecter",
    signup: "S'inscrire",
    logout: "Se déconnecter",
    profile: "Profil",
    settings: "Paramètres",
  },
  lessons: {
    startLesson: "Commencer la leçon",
    continueLesson: "Continuer la leçon",
    completed: "Terminé",
    progress: "Progression",
    difficulty: {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      advanced: "Avancé",
    },
  },
  profile: {
    languagePreference: "Préférence de langue",
    changePassword: "Changer le mot de passe",
    deleteAccount: "Supprimer le compte",
  },
};
```
