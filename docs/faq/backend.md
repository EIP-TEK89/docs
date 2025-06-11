---
sidebar_position: 3
title: FAQ Backend
description: Questions fréquemment posées sur le backend de l'application Trio Signo.
---

# FAQ Backend

Voici les réponses aux questions fréquemment posées concernant le backend de Trio Signo.

## Architecture et Technologies

### Quelles technologies sont utilisées pour le backend de Trio Signo ?

Le backend de Trio Signo est construit avec les technologies suivantes :

- **Node.js** comme environnement d'exécution
- **NestJS** comme framework web
- **TypeScript** pour le typage statique
- **Prisma** comme ORM (Object-Relational Mapping)
- **PostgreSQL** comme base de données principale
- **JWT** (JSON Web Tokens) pour l'authentification
- **OAuth2** pour l'authentification via Google
- **Jest** pour les tests unitaires et d'intégration
- **Docker** pour la conteneurisation

### Comment est organisée l'architecture backend ?

L'architecture backend suit une structure modulaire propre à NestJS :

1. **Modules** : Chaque fonctionnalité majeure est encapsulée dans un module
2. **Contrôleurs** : Gèrent les endpoints API et le routage
3. **Services** : Contiennent la logique métier principale
4. **DTOs** : Définissent la structure des données d'entrée et de sortie
5. **Entités** : Représentent les modèles de données
6. **Pipes** : Valident et transforment les données entrantes
7. **Guards** : Protègent les routes avec l'authentification et l'autorisation
8. **Interceptors** : Manipulent les requêtes et les réponses

Cette architecture modulaire permet une séparation claire des responsabilités et facilite la maintenance et les tests.

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
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password      String
  profilePicture String?
  level         Int       @default(1)
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  progress      Progress?
  badges        Badge[]
  dailyStreak   Int       @default(0)
  lastActive    DateTime  @default(now())
}

// Modèle de progression
model Progress {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  lessonsCompleted  String[]
  exercisesCompleted String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Développement

### Comment configurer l'environnement de développement backend ?

Pour configurer l'environnement de développement backend :

1. Clonez le dépôt Git :

   ```bash
   git clone https://github.com/EIP-TEK89/trio-signo-fullstack.git
   cd trio-signo-fullstack/trio-signo-server
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :

   ```bash
   cp .env.example .env
   # Modifiez les variables dans le fichier .env selon votre configuration
   ```

4. Exécutez les migrations Prisma :

   ```bash
   npx prisma migrate dev
   ```

5. Lancez le serveur de développement :
   ```bash
   npm run start:dev
   ```

Le serveur sera disponible à l'adresse http://localhost:3000 (ou le port configuré dans .env).

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

1. **Créez un nouveau module** dans `src/modules/` :

```typescript
// src/modules/signs/signs.module.ts
import { Module } from "@nestjs/common";
import { SignsController } from "./signs.controller";
import { SignsService } from "./signs.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SignsController],
  providers: [SignsService],
  exports: [SignsService],
})
export class SignsModule {}
```

2. **Créez un contrôleur** dans le même module :

```typescript
// src/modules/signs/signs.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { SignsService } from "./signs.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateSignDto, UpdateSignDto } from "./dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("signs")
@Controller("signs")
export class SignsController {
  constructor(private readonly signsService: SignsService) {}

  @Get()
  @ApiOperation({ summary: "Get all signs" })
  @ApiResponse({ status: 200, description: "Return all signs." })
  async getAllSigns(
    @Query("category") category?: string,
    @Query("difficulty") difficulty?: string,
    @Query("search") search?: string
  ) {
    return this.signsService.getAllSigns({
      category,
      difficulty,
      search,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a sign by id" })
  @ApiResponse({ status: 200, description: "Return the sign." })
  @ApiResponse({ status: 404, description: "Sign not found." })
  async getSignById(@Param("id") id: string) {
    return this.signsService.getSignById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "Create a new sign" })
  async createSign(@Body() createSignDto: CreateSignDto) {
    return this.signsService.createSign(createSignDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "Update a sign" })
  async updateSign(
    @Param("id") id: string,
    @Body() updateSignDto: UpdateSignDto
  ) {
    return this.signsService.updateSign(id, updateSignDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Delete a sign" })
  async deleteSign(@Param("id") id: string) {
    return this.signsService.deleteSign(id);
  }
}
```

3. **Créez un service** dans le même module :

```typescript
// src/modules/signs/signs.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateSignDto, UpdateSignDto } from "./dto";

interface SignFilter {
  category?: string;
  difficulty?: string;
  search?: string;
}

@Injectable()
export class SignsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.sign.findMany({
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
    const sign = await this.prisma.sign.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!sign) {
      throw new NotFoundException(`Sign with ID ${id} not found`);
    }

    return sign;
  }

  async createSign(data: CreateSignDto) {
    return this.prisma.sign.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async updateSign(id: string, data: UpdateSignDto) {
    return this.prisma.sign.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteSign(id: string) {
    return this.prisma.sign.delete({
      where: { id },
    });
  }
}
```

4. **Créez les DTOs** pour la validation des données :

```typescript
// src/modules/signs/dto/index.ts
export * from "./create-sign.dto";
export * from "./update-sign.dto";

// src/modules/signs/dto/create-sign.dto.ts
import { IsString, IsUrl, IsEnum, IsUUID, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum SignDifficulty {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export class CreateSignDto {
  @IsString()
  @ApiProperty({ description: "The name of the sign" })
  name: string;

  @IsString()
  @ApiProperty({ description: "Description of the sign" })
  description: string;

  @IsUrl()
  @ApiProperty({ description: "URL to the video of the sign" })
  videoUrl: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ description: "URL to the image of the sign", required: false })
  imageUrl?: string | null;

  @IsEnum(SignDifficulty)
  @ApiProperty({
    enum: SignDifficulty,
    description: "Difficulty level of the sign",
  })
  difficulty: SignDifficulty;

  @IsUUID()
  @ApiProperty({ description: "ID of the category this sign belongs to" })
  categoryId: string;
}

// src/modules/signs/dto/update-sign.dto.ts
import { PartialType } from "@nestjs/swagger";
import { CreateSignDto } from "./create-sign.dto";

export class UpdateSignDto extends PartialType(CreateSignDto) {}
```

5. **Importez le module** dans l'application principale :

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { SignsModule } from "./modules/signs/signs.module";
// Autres imports de modules...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SignsModule,
    // Autres modules...
  ],
})
export class AppModule {}
```

### Comment gérer l'authentification et l'autorisation ?

L'authentification et l'autorisation sont gérées comme suit :

1. **Authentification** : Utilise JWT (JSON Web Tokens) pour vérifier l'identité des utilisateurs

```typescript
// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
} {
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
// src/modules/auth/decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

3. **Service d'authentification** : Gère la connexion, l'inscription et la gestion des tokens

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      token: this.jwtService.sign(payload),
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
    const existingUser = await this.prisma.user.findFirst({
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
    const user = await this.prisma.user.create({
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
    await this.prisma.userPreference.create({
      data: {
        userId: user.id,
        language: "fr",
        notifications: true,
        darkMode: false,
        learningGoal: 10,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
```

### Comment implémenter une validation robuste des données ?

La validation des données est implémentée à l'aide de la bibliothèque class-validator et du système de pipes de NestJS :

1. **Définition des DTO (Data Transfer Objects)** :

```typescript
// src/modules/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @IsEmail({}, { message: "Email invalide" })
  @ApiProperty({ example: "user@example.com" })
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: "username123" })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Le mot de passe est trop faible",
  })
  @ApiProperty({ example: "Password123!" })
  password: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ required: false, example: "John" })
  firstName?: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ required: false, example: "Doe" })
  lastName?: string;
}

// src/modules/auth/dto/login.dto.ts
import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: "user@example.com" })
  email: string;

  @IsString()
  @ApiProperty({ example: "Password123!" })
  password: string;
}
```

2. **Configuration de la validation globale** :
   .string()
   .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
   .max(30),
   password: z
   .string()
   // La section ci-dessus a été remplacée par class-validator et NestJS validation pipes

```typescript
// src/main.ts
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans les DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non définies
      transform: true, // Transforme automatiquement les données selon les types des DTO
    })
  );

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle("Trio Signo API")
    .setDescription("API de l'application Trio Signo")
    .setVersion("1.0")
    .addTag("auth")
    .addTag("users")
    .addTag("signs")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3001);
}
bootstrap();
```

3. **Utilisation dans les contrôleurs** :

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered." })
  @ApiResponse({ status: 400, description: "Bad request." })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({ status: 200, description: "User successfully logged in." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    return this.authService.login(user);
  }
}
```

## Tests et Qualité de Code

### Comment tester le backend ?

Le backend est testé à plusieurs niveaux :

1. **Tests unitaires** avec Jest :

```typescript
// src/modules/users/users.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return a user when found", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        username: "testuser",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById("123");

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById("123")).rejects.toThrow();

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
    });
  });

  // Plus de tests...
});
```

2. **Tests d'intégration** avec le module de test NestJS :

```typescript
// src/modules/auth/auth.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userPreference: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginDto = { email: "test@example.com", password: "Password123!" };
      const user = {
        id: "123",
        email: "test@example.com",
        username: "testuser",
        role: "STUDENT",
      };
      const loginResult = {
        token: "jwt-token",
        user,
      };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(loginResult);
    });

    it("should throw UnauthorizedException with invalid credentials", async () => {
      const loginDto = { email: "test@example.com", password: "WrongPassword" };

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException("Invalid credentials")
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  // Plus de tests...
});
```

3. **Tests end-to-end (e2e)** avec le module de test NestJS et Supertest :

```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import * as bcrypt from "bcrypt";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Nettoyer la base de données de test
    await prismaService.user.deleteMany();

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    await prismaService.user.create({
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
    await prismaService.user.deleteMany();
    await prismaService.$disconnect();
    await app.close();
  });

  describe("/auth/login (POST)", () => {
    it("should login successfully with valid credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "Password123!",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("token");
          expect(res.body.user).toHaveProperty("id");
          expect(res.body.user.email).toBe("test@example.com");
        });
    });

    it("should return 401 with invalid credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "WrongPassword",
        })
        .expect(401);
    });
  });

  // Plus de tests...
});
```

4. **Exécution des tests** :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests unitaires uniquement
npm run test:unit

# Exécuter les tests e2e uniquement
npm run test:e2e

# Exécuter les tests avec couverture
npm run test:cov
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
