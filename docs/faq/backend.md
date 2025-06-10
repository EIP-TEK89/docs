---
sidebar_position: 3
title: FAQ Backend
description: Questions fréquemment posées sur le backend de l'application TrioSigno.
---

# FAQ Backend

Voici les réponses aux questions fréquemment posées concernant le backend de TrioSigno.

## Architecture et Technologies

### Quelles technologies sont utilisées pour le backend de TrioSigno ?

Le backend de TrioSigno est construit avec les technologies suivantes :

- **Node.js** comme environnement d'exécution
- **Express** comme framework web
- **TypeScript** pour le typage statique
- **Prisma** comme ORM (Object-Relational Mapping)
- **PostgreSQL** comme base de données principale
- **Redis** pour le cache et les sessions
- **JWT** (JSON Web Tokens) pour l'authentification
- **Socket.io** pour les communications en temps réel
- **Jest** pour les tests unitaires et d'intégration
- **Supertest** pour les tests API
- **Docker** pour la conteneurisation

### Comment est organisée l'architecture backend ?

L'architecture backend suit une approche en couches :

1. **Routes** : Définissent les endpoints API et dirigent les requêtes vers les contrôleurs
2. **Contrôleurs** : Gèrent la logique de traitement des requêtes HTTP
3. **Services** : Contiennent la logique métier principale
4. **Repositories** : Gèrent les interactions avec la base de données
5. **Modèles** : Définissent la structure des données (via Prisma)
6. **Middleware** : Fonctions intermédiaires pour l'authentification, la validation, etc.
7. **Utils** : Fonctions utilitaires réutilisables

Cette architecture permet une séparation claire des responsabilités et facilite la maintenance et les tests.

### Comment est gérée la base de données ?

La base de données est gérée à travers plusieurs mécanismes :

1. **Schéma Prisma** : Le fichier `schema.prisma` définit tous les modèles de données et leurs relations
2. **Migrations** : Les changements de schéma sont gérés via les migrations Prisma pour un déploiement sécurisé
3. **Seed** : Des données initiales peuvent être chargées via les scripts de seed
4. **Transactions** : Les opérations complexes sont encapsulées dans des transactions pour assurer l'intégrité des données
5. **Optimisation** : Des index sont définis pour les requêtes fréquentes, et les relations sont chargées avec `include` selon les besoins

Exemple de schéma Prisma pour un modèle `User` et ses relations :

```prisma
model User {
  id              String           @id @default(uuid())
  email           String           @unique
  username        String           @unique
  password        String
  firstName       String?
  lastName        String?
  role            UserRole         @default(STUDENT)
  profilePicture  String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  isActive        Boolean          @default(true)
  progress        Progress[]
  sessions        LearningSession[]
  achievements    UserAchievement[]
  userPreferences UserPreference?
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}
```

## Développement

### Comment configurer l'environnement de développement backend ?

Pour configurer l'environnement de développement backend :

1. Clonez le dépôt Git :

   ```bash
   git clone https://github.com/triosigno/triosigno.git
   cd triosigno/server
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :

   - Copiez le fichier `.env.example` vers `.env`
   - Modifiez les valeurs selon votre configuration

4. Configurez la base de données :

   ```bash
   # Démarrer PostgreSQL (si nécessaire)
   docker-compose up -d postgres

   # Appliquer les migrations
   npx prisma migrate dev

   # Générer le client Prisma
   npx prisma generate

   # Charger les données initiales
   npm run seed
   ```

5. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

Le serveur sera disponible à l'adresse http://localhost:3001 (ou le port configuré dans .env).

### Comment créer un nouvel endpoint API ?

Pour créer un nouvel endpoint API, suivez ces étapes :

1. **Créez un nouveau fichier de route** dans `routes/` si nécessaire :

```typescript
// routes/signRoutes.ts
import express from "express";
import {
  getSignById,
  getAllSigns,
  createSign,
  updateSign,
  deleteSign,
} from "../controllers/signController";
import { authenticate, authorize } from "../middleware/auth";
import { validateSignData } from "../middleware/validation";

const router = express.Router();

router.get("/signs", getAllSigns);
router.get("/signs/:id", getSignById);
router.post(
  "/signs",
  authenticate,
  authorize(["ADMIN", "TEACHER"]),
  validateSignData,
  createSign
);
router.put(
  "/signs/:id",
  authenticate,
  authorize(["ADMIN", "TEACHER"]),
  validateSignData,
  updateSign
);
router.delete("/signs/:id", authenticate, authorize(["ADMIN"]), deleteSign);

export default router;
```

2. **Créez un contrôleur** dans `controllers/` :

```typescript
// controllers/signController.ts
import { Request, Response, NextFunction } from "express";
import { SignService } from "../services/signService";
import { AppError, NotFoundError } from "../utils/errors";

const signService = new SignService();

export async function getAllSigns(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category, difficulty, search } = req.query;
    const signs = await signService.getAllSigns({
      category: category as string,
      difficulty: difficulty as string,
      search: search as string,
    });
    res.json(signs);
  } catch (error) {
    next(error);
  }
}

export async function getSignById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const sign = await signService.getSignById(id);

    if (!sign) {
      return next(new NotFoundError(`Sign with ID ${id} not found`));
    }

    res.json(sign);
  } catch (error) {
    next(error);
  }
}

// Autres fonctions de contrôleur : createSign, updateSign, deleteSign...
```

3. **Créez un service** dans `services/` :

```typescript
// services/signService.ts
import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

interface SignFilter {
  category?: string;
  difficulty?: string;
  search?: string;
}

export class SignService {
  async getAllSigns(filter: SignFilter = {}) {
    const where: Prisma.SignWhereInput = {};

    if (filter.category) {
      where.categoryId = filter.category;
    }

    if (filter.difficulty) {
      where.difficulty = filter.difficulty as any;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    return prisma.sign.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async getSignById(id: string) {
    return prisma.sign.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  // Autres méthodes : createSign, updateSign, deleteSign...
}
```

4. **Ajoutez les validations** si nécessaire :

```typescript
// middleware/validation.ts
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const signSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  videoUrl: z.string().url(),
  imageUrl: z.string().url().optional().nullable(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().uuid(),
});

export function validateSignData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    signSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.errors,
      });
    }
    next(error);
  }
}
```

5. **Enregistrez les routes** dans l'application principale :

```typescript
// app.ts
import express from "express";
import signRoutes from "./routes/signRoutes";

const app = express();

// Middleware...

// Routes
app.use("/api", signRoutes);

// Gestionnaire d'erreurs...

export { app };
```

### Comment gérer l'authentification et l'autorisation ?

L'authentification et l'autorisation sont gérées comme suit :

1. **Authentification** : Utilise JWT (JSON Web Tokens) pour vérifier l'identité des utilisateurs

```typescript
// middleware/auth.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { UserRole } from "@prisma/client";

// Interface pour étendre l'objet Request avec l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Authentication token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else {
      next(error);
    }
  }
}

export function authorize(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("User not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
}
```

2. **Autorisation** : Vérifie que l'utilisateur authentifié a les permissions nécessaires pour accéder à une ressource

```typescript
// Exemple d'utilisation dans les routes
router.post(
  "/lessons",
  authenticate,
  authorize(["ADMIN", "TEACHER"]),
  createLesson
);
```

3. **Service d'authentification** : Gère la connexion, l'inscription et la gestion des tokens

```typescript
// services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { UnauthorizedError } from "../utils/errors";

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Vérifier si l'email ou le nom d'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      throw new Error(
        existingUser.email === userData.email
          ? "Email already in use"
          : "Username already taken"
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "STUDENT", // Rôle par défaut
      },
    });

    // Créer les préférences utilisateur par défaut
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        language: "fr",
        notifications: true,
        darkMode: false,
        learningGoal: 10,
      },
    });

    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  private generateToken(userId: string, role: string) {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }
}
```

### Comment implémenter une validation robuste des données ?

La validation des données est implémentée à l'aide de la bibliothèque Zod :

1. **Définition des schémas de validation** :

```typescript
// validation/schemas.ts
import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Email invalide"),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  moduleId: z.string().uuid("ID de module invalide"),
  order: z.number().int().positive(),
});

// Plus de schémas...
```

2. **Middleware de validation** :

```typescript
// middleware/validation.ts
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
```

3. **Utilisation dans les routes** :

```typescript
// routes/userRoutes.ts
import express from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { validate } from "../middleware/validation";
import { userSchema, loginSchema } from "../validation/schemas";

const router = express.Router();

router.post("/register", validate(userSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
```

## Tests et Qualité de Code

### Comment tester le backend ?

Le backend est testé à plusieurs niveaux :

1. **Tests unitaires** avec Jest :

```typescript
// __tests__/services/userService.test.ts
import { UserService } from "../../services/userService";
import { prisma } from "../../config/database";

// Mock Prisma
jest.mock("../../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return a user when found", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        username: "testuser",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById("123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById("123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
      expect(result).toBeNull();
    });
  });

  // Plus de tests...
});
```

2. **Tests d'intégration** avec Supertest :

```typescript
// __tests__/integration/auth.test.ts
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../config/database";
import bcrypt from "bcrypt";

describe("Auth API", () => {
  beforeAll(async () => {
    // Préparer la base de données de test
    await prisma.user.deleteMany();

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash("Password123", 10);
    await prisma.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        password: hashedPassword,
        role: "STUDENT",
      },
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 401 with invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  // Plus de tests...
});
```

3. **Exécution des tests** :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests unitaires uniquement
npm run test:unit

# Exécuter les tests d'intégration uniquement
npm run test:integration

# Exécuter les tests avec couverture
npm run test:coverage
```

### Comment assurer la qualité du code ?

La qualité du code est assurée par plusieurs outils et pratiques :

1. **ESLint** pour l'analyse statique du code :

```json
// .eslintrc
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

2. **Prettier** pour le formatage du code :

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

3. **Husky** pour les hooks de pré-commit :

```json
// package.json (extrait)
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

4. **Documentation du code** avec JSDoc :

```typescript
/**
 * Service pour gérer les interactions avec les leçons.
 */
export class LessonService {
  /**
   * Récupère une leçon par son identifiant.
   *
   * @param id - L'identifiant unique de la leçon
   * @returns La leçon si trouvée, null sinon
   */
  async getLessonById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        module: true,
        lessonSigns: {
          include: { sign: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  // Autres méthodes...
}
```

### Comment déboguer le backend ?

Pour déboguer le backend de TrioSigno :

1. **Utiliser le débogueur VS Code** :

   - Configurer le fichier `launch.json` :

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Server",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/dist/server.js",
         "preLaunchTask": "tsc: build - tsconfig.json",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"],
         "env": {
           "NODE_ENV": "development"
         }
       },
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Tests",
         "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
         "args": ["--runInBand"],
         "console": "integratedTerminal",
         "internalConsoleOptions": "neverOpen"
       }
     ]
   }
   ```

   - Définir des points d'arrêt dans le code
   - Lancer la configuration de débogage appropriée

2. **Utiliser les logs** :

   - Configurer un système de logging structuré avec Winston :

   ```typescript
   // utils/logger.ts
   import winston from "winston";

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || "info",
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     defaultMeta: { service: "triosigno-api" },
     transports: [
       new winston.transports.Console({
         format: winston.format.combine(
           winston.format.colorize(),
           winston.format.simple()
         ),
       }),
       new winston.transports.File({ filename: "error.log", level: "error" }),
       new winston.transports.File({ filename: "combined.log" }),
     ],
   });

   export default logger;
   ```

   - Utiliser le logger dans le code :

   ```typescript
   import logger from "../utils/logger";

   export async function getAllLessons(
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     try {
       logger.info("Fetching all lessons", { userId: req.user?.id });
       const lessons = await lessonService.getAllLessons();
       res.json(lessons);
     } catch (error) {
       logger.error("Failed to fetch lessons", {
         error: error.message,
         stack: error.stack,
       });
       next(error);
     }
   }
   ```

3. **Outils de monitoring** :
   - Utiliser des outils comme New Relic ou Datadog pour surveiller les performances
   - Configurer Prometheus pour collecter des métriques
   - Utiliser des traceurs de requêtes pour identifier les goulots d'étranglement

## Performance et Sécurité

### Comment optimiser les performances du backend ?

Pour optimiser les performances du backend de TrioSigno :

1. **Mise en cache** :

   - Utiliser Redis pour mettre en cache les données fréquemment accédées :

   ```typescript
   // services/cacheService.ts
   import { createClient } from "redis";
   import { promisify } from "util";

   const client = createClient({
     url: process.env.REDIS_URL,
   });

   // Promisify pour une utilisation plus facile avec async/await
   const getAsync = promisify(client.get).bind(client);
   const setAsync = promisify(client.set).bind(client);
   const delAsync = promisify(client.del).bind(client);

   export class CacheService {
     async get<T>(key: string): Promise<T | null> {
       const data = await getAsync(key);
       if (!data) return null;
       return JSON.parse(data) as T;
     }

     async set<T>(
       key: string,
       value: T,
       expireSeconds?: number
     ): Promise<void> {
       const stringValue = JSON.stringify(value);
       if (expireSeconds) {
         await setAsync(key, stringValue, "EX", expireSeconds);
       } else {
         await setAsync(key, stringValue);
       }
     }

     async delete(key: string): Promise<void> {
       await delAsync(key);
     }
   }
   ```

2. **Optimisation des requêtes de base de données** :

   - Utiliser des index appropriés
   - Limiter les champs sélectionnés avec `select`
   - Utiliser la pagination pour les grandes collections
   - Éviter les requêtes N+1 avec `include`

3. **Compression** :

   - Utiliser la compression pour réduire la taille des réponses :

   ```typescript
   import compression from "compression";

   app.use(compression());
   ```

4. **Gestion des charges lourdes** :

   - Implémenter des files d'attente pour les tâches intensives
   - Utiliser des workers pour les tâches en arrière-plan

   ```typescript
   // services/queueService.ts
   import Bull from "bull";

   // File d'attente pour le traitement des vidéos
   const videoProcessingQueue = new Bull("video-processing", {
     redis: process.env.REDIS_URL,
   });

   // Définir le processeur de tâches
   videoProcessingQueue.process(async (job) => {
     const { videoId } = job.data;
     // Logique de traitement vidéo...
     return { status: "completed", videoId };
   });

   export function queueVideoProcessing(videoId: string) {
     return videoProcessingQueue.add({ videoId });
   }
   ```

5. **Optimisation de Node.js** :
   - Utiliser un gestionnaire de cluster pour utiliser plusieurs cœurs CPU
   - Configurer les limites de mémoire appropriées
   - Surveiller et gérer les fuites de mémoire

### Comment sécuriser l'API backend ?

Pour sécuriser l'API backend de TrioSigno :

1. **Protection contre les attaques courantes** :

   - Utiliser Helmet pour sécuriser les en-têtes HTTP :

   ```typescript
   import helmet from "helmet";

   app.use(helmet());
   ```

   - Limiter le taux de requêtes pour prévenir les attaques par force brute :

   ```typescript
   import rateLimit from "express-rate-limit";

   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // 100 requêtes par IP
     message: "Too many requests from this IP, please try again later",
   });

   // Appliquer à toutes les routes d'API
   app.use("/api", apiLimiter);

   // Limites plus strictes pour les routes d'authentification
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 10,
     message: "Too many login attempts, please try again later",
   });

   app.use("/api/auth", authLimiter);
   ```

   - Protection contre les attaques XSS :

   ```typescript
   import xss from "xss-clean";

   app.use(xss());
   ```

   - Protection contre les attaques de pollution de paramètres HTTP :

   ```typescript
   import hpp from "hpp";

   app.use(hpp());
   ```

2. **Gestion sécurisée des mots de passe** :

   - Utiliser bcrypt pour hacher les mots de passe :

   ```typescript
   import bcrypt from "bcrypt";

   async function hashPassword(password: string): Promise<string> {
     const saltRounds = 12;
     return bcrypt.hash(password, saltRounds);
   }

   async function verifyPassword(
     plainPassword: string,
     hashedPassword: string
   ): Promise<boolean> {
     return bcrypt.compare(plainPassword, hashedPassword);
   }
   ```

3. **Authentification et autorisation robustes** :

   - Utiliser JWT pour l'authentification (comme indiqué précédemment)
   - Implémenter l'authentification à deux facteurs :

   ```typescript
   import speakeasy from "speakeasy";
   import QRCode from "qrcode";

   export class TwoFactorService {
     async generateSecret(userId: string) {
       const secret = speakeasy.generateSecret({
         name: `TrioSigno:${userId}`,
       });

       // Stocker le secret dans la base de données
       await prisma.user.update({
         where: { id: userId },
         data: { twoFactorSecret: secret.base32 },
       });

       // Générer le QR code
       const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

       return {
         secret: secret.base32,
         qrCodeUrl,
       };
     }

     async verifyToken(userId: string, token: string) {
       const user = await prisma.user.findUnique({
         where: { id: userId },
         select: { twoFactorSecret: true },
       });

       if (!user || !user.twoFactorSecret) {
         return false;
       }

       return speakeasy.totp.verify({
         secret: user.twoFactorSecret,
         encoding: "base32",
         token,
       });
     }
   }
   ```

4. **Validation des entrées** :

   - Utiliser Zod pour valider toutes les entrées utilisateur (comme indiqué précédemment)
   - Nettoyer et échapper les données avant de les stocker ou de les afficher

5. **Audit et journalisation** :

   - Enregistrer les événements de sécurité importants :

   ```typescript
   // services/auditService.ts
   import { prisma } from "../config/database";
   import logger from "../utils/logger";

   export enum AuditAction {
     LOGIN = "LOGIN",
     LOGOUT = "LOGOUT",
     REGISTER = "REGISTER",
     UPDATE_PROFILE = "UPDATE_PROFILE",
     CHANGE_PASSWORD = "CHANGE_PASSWORD",
     ADMIN_ACTION = "ADMIN_ACTION",
   }

   export class AuditService {
     async logAction(
       userId: string,
       action: AuditAction,
       details: Record<string, any>,
       ip: string
     ) {
       // Enregistrer dans la base de données
       await prisma.auditLog.create({
         data: {
           userId,
           action,
           details: JSON.stringify(details),
           ip,
           timestamp: new Date(),
         },
       });

       // Également logger pour le monitoring
       logger.info(`Audit: ${action}`, {
         userId,
         action,
         details,
         ip,
       });
     }
   }
   ```

### Comment gérer la montée en charge ?

Pour gérer la montée en charge du backend TrioSigno :

1. **Architecture scalable** :

   - Utiliser une architecture de microservices ou de monolithe modulaire
   - Containeriser l'application avec Docker pour faciliter le déploiement
   - Utiliser Kubernetes pour l'orchestration et la mise à l'échelle automatique

2. **Mise à l'échelle horizontale** :

   - Déployer plusieurs instances de l'API derrière un équilibreur de charge
   - Utiliser PM2 ou Kubernetes pour gérer plusieurs instances

   ```
   # Exemple de configuration PM2
   module.exports = {
     apps: [{
       name: 'triosigno-api',
       script: 'dist/server.js',
       instances: 'max', // Utiliser tous les CPU disponibles
       exec_mode: 'cluster',
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   };
   ```

3. **Base de données scalable** :

   - Configurer des réplicas pour la lecture
   - Implémenter le sharding pour distribuer la charge
   - Utiliser des pools de connexions pour gérer efficacement les connexions

4. **Caching distribué** :

   - Utiliser Redis Cluster pour un cache distribué
   - Mettre en cache les résultats de requêtes fréquentes et coûteuses
   - Implémenter des stratégies d'invalidation de cache efficaces

5. **Optimisation des ressources** :
   - Utiliser des connexions persistantes pour les services externes
   - Implementer des circuit breakers pour éviter les défaillances en cascade
   - Surveiller et ajuster les ressources selon les besoins

## Déploiement

### Comment déployer le backend en production ?

Le déploiement du backend TrioSigno en production suit ces étapes :

1. **Préparation pour la production** :

   - Compiler le code TypeScript :

   ```bash
   npm run build
   ```

   - Vérifier les variables d'environnement de production dans `.env.production`
   - Exécuter les migrations de base de données :

   ```bash
   npx prisma migrate deploy
   ```

2. **Conteneurisation avec Docker** :

   - Dockerfile pour le backend :

   ```dockerfile
   FROM node:16-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   # Stage 2: Production image
   FROM node:16-alpine

   WORKDIR /app

   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/prisma ./prisma

   ENV NODE_ENV=production

   RUN npm ci --only=production
   RUN npx prisma generate

   EXPOSE 3001

   CMD ["node", "dist/server.js"]
   ```

   - Construction de l'image :

   ```bash
   docker build -t triosigno/backend:latest .
   ```

3. **Déploiement avec Docker Compose** :

   - Configuration docker-compose.yml :

   ```yaml
   version: "3.8"

   services:
     api:
       image: triosigno/backend:latest
       restart: always
       depends_on:
         - postgres
         - redis
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:password@postgres:5432/triosigno
         - REDIS_URL=redis://redis:6379
         - JWT_SECRET=${JWT_SECRET}
         - PORT=3001
       ports:
         - "3001:3001"

     postgres:
       image: postgres:14
       restart: always
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=triosigno
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:6
       restart: always
       volumes:
         - redis_data:/data

   volumes:
     postgres_data:
     redis_data:
   ```

   - Déploiement :

   ```bash
   docker-compose up -d
   ```

4. **Déploiement avec Kubernetes** :

   - Création des fichiers de configuration Kubernetes
   - Déploiement avec kubectl :

   ```bash
   kubectl apply -f k8s/
   ```

5. **Configuration d'un proxy inverse** :

   - Utiliser Nginx comme proxy inverse :

   ```nginx
   server {
     listen 80;
     server_name api.triosigno.com;

     location / {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   - Configurer HTTPS avec Let's Encrypt

### Comment gérer les mises à jour et les migrations en production ?

Pour gérer les mises à jour et les migrations en production :

1. **Migrations de base de données** :

   - Utiliser les migrations Prisma pour les changements de schéma :

   ```bash
   # En développement, créer une nouvelle migration
   npx prisma migrate dev --name nom_de_la_migration

   # En production, appliquer les migrations en attente
   npx prisma migrate deploy
   ```

   - Planifier les migrations pendant les périodes de faible trafic
   - Tester les migrations sur un environnement de staging d'abord

2. **Stratégie de déploiement** :

   - Utiliser une stratégie de déploiement blue-green ou canary :
     - **Blue-Green** : Préparer un nouvel environnement et basculer le trafic une fois prêt
     - **Canary** : Diriger progressivement le trafic vers la nouvelle version
   - Automatiser le déploiement avec CI/CD (GitHub Actions, Jenkins, etc.)

3. **Rollback** :

   - Préparer une stratégie de rollback pour chaque déploiement
   - Conserver des snapshots de la base de données avant les migrations majeures
   - Tester les procédures de rollback régulièrement

4. **Zéro temps d'arrêt** :
   - Configurer l'équilibrage de charge pour maintenir la disponibilité pendant les mises à jour
   - Utiliser des health checks pour s'assurer que les nouvelles instances sont prêtes avant de recevoir du trafic
   - Implémenter des techniques de mise à jour progressive pour minimiser l'impact

### Comment surveiller le backend en production ?

Pour surveiller le backend en production :

1. **Logging** :

   - Utiliser un système de logging centralisé (ELK Stack, Graylog) :

   ```typescript
   // Configuration pour envoyer les logs à Elasticsearch
   import winston from "winston";
   import { ElasticsearchTransport } from "winston-elasticsearch";

   const logger = winston.createLogger({
     level: "info",
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     defaultMeta: { service: "triosigno-api" },
     transports: [
       new winston.transports.Console(),
       new ElasticsearchTransport({
         level: "info",
         index: "logs-triosigno",
         clientOpts: {
           node: process.env.ELASTICSEARCH_URL,
         },
       }),
     ],
   });
   ```

   - Définir des niveaux de log appropriés
   - Structurer les logs pour faciliter l'analyse

2. **Métriques** :

   - Collecter des métriques avec Prometheus :

   ```typescript
   import express from "express";
   import promBundle from "express-prom-bundle";

   const app = express();

   // Ajouter le middleware Prometheus
   const metricsMiddleware = promBundle({
     includeMethod: true,
     includePath: true,
     includeStatusCode: true,
     includeUp: true,
     promClient: {
       collectDefaultMetrics: {},
     },
   });

   app.use(metricsMiddleware);
   ```

   - Visualiser les métriques avec Grafana
   - Configurer des tableaux de bord pour les métriques clés

3. **Alertes** :

   - Configurer des alertes basées sur des seuils pour les métriques importantes
   - Utiliser PagerDuty ou des services similaires pour la gestion des incidents
   - Définir des procédures d'escalade claires

4. **Traçage** :

   - Implémenter un système de traçage distribué (Jaeger, Zipkin) :

   ```typescript
   import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
   import { NodeTracerProvider } from "@opentelemetry/node";
   import { SimpleSpanProcessor } from "@opentelemetry/tracing";
   import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
   import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

   // Configurer le provider de traçage
   const provider = new NodeTracerProvider();

   // Configurer l'exportateur Jaeger
   const exporter = new JaegerExporter({
     serviceName: "triosigno-api",
     endpoint: process.env.JAEGER_ENDPOINT,
   });

   // Ajouter le processeur de spans à l'exportateur
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

   // Enregistrer le provider
   provider.register();

   // Instrumentations pour Express et HTTP
   const expressInstrumentation = new ExpressInstrumentation();
   const httpInstrumentation = new HttpInstrumentation();

   expressInstrumentation.enable();
   httpInstrumentation.enable();
   ```

   - Analyser les traces pour identifier les goulots d'étranglement

5. **Health Checks** :

   - Implémenter des endpoints de santé pour les vérifications de disponibilité :

   ```typescript
   app.get("/health", (req, res) => {
     res.status(200).json({ status: "UP" });
   });

   app.get("/health/detailed", async (req, res) => {
     try {
       // Vérifier la connexion à la base de données
       await prisma.$queryRaw`SELECT 1`;

       // Vérifier la connexion à Redis
       const redisStatus = await checkRedisConnection();

       res.status(200).json({
         status: "UP",
         details: {
           database: "UP",
           redis: redisStatus ? "UP" : "DOWN",
         },
       });
     } catch (error) {
       res.status(503).json({
         status: "DOWN",
         details: {
           database: error.message.includes("database") ? "DOWN" : "UP",
           redis: "UNKNOWN",
         },
       });
     }
   });
   ```

   - Configurer des vérifications de santé régulières dans votre système de monitoring
