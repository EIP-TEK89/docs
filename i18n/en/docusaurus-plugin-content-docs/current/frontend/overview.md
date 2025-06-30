---
sidebar_position: 1
---

# Frontend Overview

## Introduction

TrioSigno's frontend is developed with React and TypeScript, providing an intuitive and responsive user interface for learning French sign language.

## Core Technologies

- **React 19**: JavaScript library for building user interfaces
- **TypeScript 5.8**: JavaScript superset with static typing
- **React Router 7**: For navigation between different pages
- **Context API**: For global state management
- **Axios**: For HTTP requests to the backend
- **Tailwind CSS 4**: For component styling
- **i18next**: For application internationalization
- **Vite 6**: For bundling and development

## Architecture

The architecture of TrioSigno's frontend follows modern React best practices, with a clear separation of responsibilities:

```
refacto-front-trio/
├── public/          # Static resources
├── src/
│   ├── assets/      # Images, icons and other resources
│   ├── components/  # Reusable React components
│   │   ├── ui/      # Generic UI components
│   │   ├── lessons/ # Lesson-specific components
│   │   └── ...      # Other components organized by functionality
│   ├── constants/   # Constants and configurations
│   ├── features/    # Features organized by domain
│   ├── hooks/       # Custom hooks
│   ├── i18n/        # Internationalization
│   │   ├── locales/ # Translations by language
│   │   └── i18n.ts  # i18n configuration
│   ├── pages/       # Page components
│   ├── services/    # API services and interceptors
│   ├── store/       # State management with Context API
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   ├── App.tsx      # Root component
│   └── main.tsx     # Entry point
└── docs/            # Frontend-specific documentation
```

## Main Features

### Authentication System

The authentication system uses JWT (JSON Web Tokens) to secure user sessions, with refresh token management via the Context API.

### Sign Language Learning

The application offers various lessons for learning sign language, with:

- Progressive learning paths
- Sign dictionary
- Interactive exercises

### Internationalization

The application is fully internationalized thanks to i18next and supports:

- French (default language)
- English
- Automatic browser language detection
- Language switching via a dedicated user interface

### User Profile

Users can:

- View their progress
- Edit their personal information
- Change language preferences
- Manage their password

## Communication with the Backend

Communication with the backend is done via REST API calls using Axios. Requests are organized in dedicated services by functional domain, with error handling and automatic token refresh.

## Build and Deployment

The frontend is built with Vite, which offers:

- Fast compilation times
- Development server with Hot Module Replacement
- Production asset optimization

The application is deployed via Docker in an nginx container optimized for serving static React applications.
