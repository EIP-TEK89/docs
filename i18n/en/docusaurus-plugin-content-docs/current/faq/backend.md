---
sidebar_position: 3
title: Backend FAQ
description: Frequently asked questions about the TrioSigno application backend.
---

# Backend FAQ

Here are answers to frequently asked questions about TrioSigno's backend.

## Architecture and Technologies

### What technologies are used for TrioSigno's backend?

TrioSigno's backend is built with the following technologies:

- **Node.js** as the runtime environment
- **Express** as the web framework
- **TypeScript** for static typing
- **Prisma** as the ORM (Object-Relational Mapping)
- **PostgreSQL** as the main database
- **Redis** for caching and sessions
- **JWT** (JSON Web Tokens) for authentication
- **Socket.io** for real-time communications
- **Jest** for unit and integration testing
- **Supertest** for API testing
- **Docker** for containerization

### How is the backend architecture organized?

The backend architecture follows a layered approach:

1. **Routes**: Define API endpoints and direct requests to controllers
2. **Controllers**: Handle HTTP request processing logic
3. **Services**: Contain the main business logic
4. **Repositories**: Manage database interactions
5. **Models**: Define data structure (via Prisma)
6. **Middleware**: Intermediate functions for authentication, validation, etc.
7. **Utils**: Reusable utility functions

This architecture allows for a clear separation of concerns and facilitates maintenance and testing.

### How is the database managed?

The database is managed through several mechanisms:

1. **Prisma Schema**: The `schema.prisma` file defines all data models and their relationships
2. **Migrations**: Schema changes are managed via Prisma migrations for safe deployment
3. **Seed**: Initial data can be loaded via seed scripts
4. **Transactions**: Complex operations are encapsulated in transactions to ensure data integrity
5. **Optimization**: Indexes are defined for frequent queries, and relations are loaded with `include` as needed

Example of a Prisma schema for a `User` model and its relationships:

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

## Development

### How do I set up the backend development environment?

To set up the backend development environment:

1. Clone the Git repository:

   ```bash
   git clone https://github.com/triosigno/triosigno.git
   cd triosigno/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy the `.env.example` file to `.env`
   - Modify the values according to your configuration

4. Set up the database:

   ```bash
   # Start PostgreSQL (if not already running)
   docker-compose up -d db

   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will be available at http://localhost:4000 by default.

### How do I create a new API endpoint?

To create a new API endpoint:

1. Define the route in the appropriate router file (e.g., `src/routes/lessonRoutes.ts`):

   ```typescript
   import express from "express";
   import { lessonController } from "../controllers/lessonController";
   import { authenticate } from "../middleware/auth";

   const router = express.Router();

   router.get("/", lessonController.getAllLessons);
   router.get("/:id", lessonController.getLessonById);
   router.post("/", authenticate, lessonController.createLesson);
   router.put("/:id", authenticate, lessonController.updateLesson);
   router.delete("/:id", authenticate, lessonController.deleteLesson);

   export default router;
   ```

2. Create or update the controller (e.g., `src/controllers/lessonController.ts`):

   ```typescript
   import { Request, Response } from "express";
   import { lessonService } from "../services/lessonService";

   export const lessonController = {
     async getAllLessons(req: Request, res: Response) {
       try {
         const lessons = await lessonService.getAllLessons();
         return res.status(200).json(lessons);
       } catch (error) {
         return res
           .status(500)
           .json({ message: "Error fetching lessons", error });
       }
     },

     async getLessonById(req: Request, res: Response) {
       try {
         const { id } = req.params;
         const lesson = await lessonService.getLessonById(id);

         if (!lesson) {
           return res.status(404).json({ message: "Lesson not found" });
         }

         return res.status(200).json(lesson);
       } catch (error) {
         return res
           .status(500)
           .json({ message: "Error fetching lesson", error });
       }
     },

     // Additional controller methods...
   };
   ```

3. Implement the service (e.g., `src/services/lessonService.ts`):

   ```typescript
   import { prisma } from "../lib/prisma";
   import { Lesson, Prisma } from "@prisma/client";

   export const lessonService = {
     async getAllLessons() {
       return prisma.lesson.findMany({
         include: {
           category: true,
           level: true,
         },
       });
     },

     async getLessonById(id: string) {
       return prisma.lesson.findUnique({
         where: { id },
         include: {
           category: true,
           level: true,
           exercises: true,
         },
       });
     },

     // Additional service methods...
   };
   ```

4. Register the router in the main app (if it's a new route group):

   ```typescript
   import lessonRoutes from "./routes/lessonRoutes";

   // ...

   app.use("/api/lessons", lessonRoutes);
   ```

### How are environment variables handled?

Environment variables in TrioSigno's backend are handled using the `dotenv` package:

1. Create a `.env` file in the root directory (based on `.env.example`)
2. Load environment variables at the beginning of the application:

   ```typescript
   // src/config/index.ts
   import dotenv from "dotenv";

   // Load environment variables
   dotenv.config();

   export default {
     port: process.env.PORT || 4000,
     nodeEnv: process.env.NODE_ENV || "development",
     databaseUrl: process.env.DATABASE_URL,
     jwtSecret: process.env.JWT_SECRET,
     jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
     redisUrl: process.env.REDIS_URL,
     corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
     // Other configuration variables...
   };
   ```

3. Access configuration values from this central config:

   ```typescript
   import config from "./config";

   const server = app.listen(config.port, () => {
     console.log(`Server running on port ${config.port}`);
   });
   ```

Different environment variables are used for different environments (development, testing, production) to ensure proper configuration.

## Testing and Quality

### How do I run backend tests?

To run backend tests:

1. Unit and integration tests with Jest:

   ```bash
   # Run all tests
   npm test

   # Run tests in watch mode (for development)
   npm run test:watch

   # Run tests with coverage report
   npm run test:coverage
   ```

2. API tests with Supertest:

   ```bash
   npm run test:api
   ```

3. E2E tests with Cypress (if applicable):
   ```bash
   npm run test:e2e
   ```

Make sure the test database is configured properly in your `.env.test` file.

### How do I debug the backend?

To debug TrioSigno's backend:

1. **Using VSCode debugger**:

   - Create a `.vscode/launch.json` file with the appropriate configuration
   - Set breakpoints in your code
   - Use the "Run and Debug" panel in VSCode

2. **Using console**:

   - Add `console.log()`, `console.debug()`, or `console.error()` statements
   - Use the `debug` package for more structured logs

3. **Using inspection**:

   - Start the application with the `--inspect` flag:
     ```bash
     node --inspect dist/index.js
     ```
   - Connect to the debugger using Chrome DevTools or Node.js debugging tools

4. **Testing specific parts**:
   - Create small test scripts to isolate and test specific functionality
   - Use Jest's `.only` modifier to run only specific tests

### How is error handling implemented?

Error handling in TrioSigno's backend is implemented at multiple levels:

1. **Global error handler middleware**:

   ```typescript
   // src/middleware/errorHandler.ts
   import { Request, Response, NextFunction } from "express";
   import { logger } from "../utils/logger";

   export function errorHandler(
     err: any,
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const status = err.statusCode || 500;
     const message = err.message || "Internal Server Error";

     logger.error(
       `[${req.method}] ${req.path} >> StatusCode: ${status}, Message: ${message}`
     );

     // Handle different types of errors
     if (err.name === "ValidationError") {
       return res.status(400).json({ message, errors: err.errors });
     }

     if (err.name === "UnauthorizedError") {
       return res.status(401).json({ message: "Unauthorized" });
     }

     // For security, don't expose internal error details in production
     if (process.env.NODE_ENV === "production") {
       return res.status(status).json({ message });
     }

     // In development, include the stack trace
     return res.status(status).json({
       message,
       stack: err.stack,
     });
   }
   ```

2. **Custom error classes**:

   ```typescript
   // src/utils/errors.ts
   export class AppError extends Error {
     statusCode: number;

     constructor(message: string, statusCode: number) {
       super(message);
       this.statusCode = statusCode;
       this.name = this.constructor.name;
       Error.captureStackTrace(this, this.constructor);
     }
   }

   export class NotFoundError extends AppError {
     constructor(resource = "Resource") {
       super(`${resource} not found`, 404);
     }
   }

   export class ValidationError extends AppError {
     errors: any;

     constructor(message: string, errors?: any) {
       super(message, 400);
       this.errors = errors;
     }
   }

   // Other custom error classes...
   ```

3. **Try-catch blocks** in controllers:

   ```typescript
   try {
     const result = await someService.doSomething();
     return res.status(200).json(result);
   } catch (error) {
     next(error); // Pass to error handler middleware
   }
   ```

4. **Error logging** using a structured logger like Winston or Pino

## Authentication and Security

### How is user authentication implemented?

User authentication in TrioSigno is implemented using JWT (JSON Web Tokens):

1. **Registration**:

   - User submits registration data
   - Password is hashed using bcrypt
   - User record is created in the database
   - A verification email is sent (optional)

2. **Login**:

   - User submits credentials
   - System verifies email/username and password
   - If valid, a JWT token is generated and returned
   - Token contains user ID and role information

3. **Authentication middleware**:

   ```typescript
   // src/middleware/auth.ts
   import { Request, Response, NextFunction } from "express";
   import jwt from "jsonwebtoken";
   import config from "../config";

   export function authenticate(
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ message: "Authentication required" });
     }

     const token = authHeader.split(" ")[1];

     try {
       const decoded = jwt.verify(token, config.jwtSecret);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({ message: "Invalid or expired token" });
     }
   }

   export function authorize(roles: string[]) {
     return (req: Request, res: Response, next: NextFunction) => {
       if (!req.user) {
         return res.status(401).json({ message: "Authentication required" });
       }

       if (!roles.includes(req.user.role)) {
         return res.status(403).json({ message: "Insufficient permissions" });
       }

       next();
     };
   }
   ```

4. **Token refresh**:

   - A refresh token mechanism allows obtaining a new access token
   - Refresh tokens have a longer lifespan but are stored securely

5. **Logout**:
   - On logout, client removes the token
   - For added security, tokens can be blacklisted using Redis

### How is data security ensured?

Data security in TrioSigno is ensured through multiple measures:

1. **HTTPS**: All communications are encrypted using TLS/SSL
2. **Password handling**:
   - Passwords are hashed using bcrypt with appropriate salt rounds
   - Original passwords are never stored
3. **Input validation**:
   - All user inputs are validated using libraries like Joi or Zod
   - Data is sanitized to prevent injection attacks
4. **Rate limiting**:
   - API endpoints are protected against brute-force attacks using rate limiting
5. **CORS configuration**:
   - Cross-Origin Resource Sharing is configured to allow only trusted origins
6. **Headers security**:
   - Security headers (Content-Security-Policy, X-XSS-Protection, etc.) are set
7. **Database security**:
   - Database access is restricted by network rules
   - Queries use parameterized statements to prevent SQL injection
8. **Auditing**:
   - Security-relevant actions are logged for audit purposes

## Performance and Scaling

### How is the API performance optimized?

API performance in TrioSigno is optimized through several techniques:

1. **Caching**:

   - Redis is used to cache frequent queries and responses
   - Cache invalidation strategies ensure data consistency
   - Example implementation:

     ```typescript
     // src/services/lessonService.ts
     import { redisClient } from "../lib/redis";

     async function getLessonById(id: string) {
       // Try to get from cache first
       const cachedLesson = await redisClient.get(`lesson:${id}`);
       if (cachedLesson) {
         return JSON.parse(cachedLesson);
       }

       // If not in cache, get from database
       const lesson = await prisma.lesson.findUnique({
         where: { id },
         include: {
           /* ... */
         },
       });

       // Store in cache for future requests
       if (lesson) {
         await redisClient.set(
           `lesson:${id}`,
           JSON.stringify(lesson),
           "EX",
           3600 // 1 hour expiration
         );
       }

       return lesson;
     }
     ```

2. **Database optimization**:

   - Proper indexes on frequently queried fields
   - Efficient query patterns using Prisma
   - Database connection pooling

3. **Pagination**:

   - All list endpoints support pagination
   - Example implementation:

     ```typescript
     async function getLessons(page = 1, limit = 20) {
       const skip = (page - 1) * limit;

       const [lessons, total] = await Promise.all([
         prisma.lesson.findMany({
           skip,
           take: limit,
           include: {
             /* ... */
           },
         }),
         prisma.lesson.count(),
       ]);

       return {
         data: lessons,
         pagination: {
           page,
           limit,
           total,
           totalPages: Math.ceil(total / limit),
         },
       };
     }
     ```

4. **Compression**:

   - HTTP response compression using gzip or brotli
   - Implementation with Express middleware:

     ```typescript
     import compression from "compression";

     app.use(compression());
     ```

5. **Asynchronous processing**:
   - Long-running tasks are offloaded to background workers
   - A job queue system using Bull/Redis handles processing

### How is the backend structured for scaling?

TrioSigno's backend is structured for scaling in the following ways:

1. **Stateless design**:

   - The API is stateless, allowing horizontal scaling
   - Session data is stored in Redis, not in memory

2. **Microservices approach** (for larger deployments):

   - Core services are separated into smaller, focused services
   - Communication between services uses message queues or REST/gRPC

3. **Load balancing**:

   - Multiple instances of the API can run behind a load balancer
   - Health check endpoints ensure traffic is directed to healthy instances

4. **Database scaling**:

   - Read replicas for read-heavy operations
   - Connection pooling to optimize database connections
   - Potential sharding for very large datasets

5. **Caching strategy**:

   - Multi-level caching (application, database, CDN)
   - Distributed cache using Redis Cluster

6. **Container orchestration**:

   - Deployment using Kubernetes or similar for managing containers
   - Auto-scaling based on traffic and resource utilization

7. **Monitoring and observability**:
   - Prometheus for metrics collection
   - Grafana for visualization
   - Distributed tracing with OpenTelemetry

### How are long-running tasks handled?

Long-running tasks in TrioSigno are handled using a job queue system:

1. **Job queue implementation**:

   ```typescript
   // src/lib/queue.ts
   import Queue from "bull";
   import config from "../config";

   export const emailQueue = new Queue("email", config.redisUrl);
   export const processingQueue = new Queue("processing", config.redisUrl);
   export const aiModelQueue = new Queue("ai-model", config.redisUrl);

   // Set up queue event handlers
   emailQueue.on("completed", (job) => {
     console.log(`Email job ${job.id} completed`);
   });

   emailQueue.on("failed", (job, err) => {
     console.error(`Email job ${job.id} failed: ${err.message}`);
   });

   // Similar handlers for other queues
   ```

2. **Adding jobs to the queue**:

   ```typescript
   // src/services/userService.ts
   import { emailQueue } from "../lib/queue";

   async function sendWelcomeEmail(user) {
     // Add email job to queue instead of sending directly
     await emailQueue.add(
       "welcome-email",
       {
         to: user.email,
         name: user.firstName,
         userId: user.id,
       },
       {
         attempts: 3,
         backoff: {
           type: "exponential",
           delay: 5000,
         },
       }
     );
   }
   ```

3. **Processing jobs**:

   ```typescript
   // src/workers/emailWorker.ts
   import { emailQueue } from "../lib/queue";
   import { emailService } from "../services/emailService";

   emailQueue.process("welcome-email", async (job) => {
     const { to, name, userId } = job.data;

     // Send the actual email
     await emailService.sendWelcomeEmail(to, name);

     // Return job result
     return { sent: true, to, timestamp: new Date() };
   });
   ```

4. **Worker management**:

   - Workers run in separate processes
   - Concurrency is configured based on task type
   - Retries and backoff strategies handle failures

5. **Monitoring job queues**:
   - Queue dashboards provide visibility into job status
   - Alerts notify of queue backlogs or high failure rates
