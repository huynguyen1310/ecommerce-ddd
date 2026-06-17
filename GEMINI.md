# Project Mandates: E-commerce DDD & Hexagonal

This file contains the foundational instructions and architectural rules for this project.

## 🏛 Architectural Mandates
- **Order Service (NestJS)**: MUST follow Strict Hexagonal Architecture. 
  - **Pure Domain**: The `Domain` layer MUST be free of all dependencies (no TypeORM, no external libs, no `crypto`).
  - **Ports & Adapters**: Use Interfaces (Ports) for all infrastructure dependencies (Repositories, Publishers). Inject them using string tokens.
  - **Boundaries**: Use DTOs for all data crossing the Application boundary (into/out of Use Cases).
  - **Mappers**: Use `Mappers` to convert Infrastructure entities to Domain entities.
- **Catalog Service (Laravel)**: MUST follow Pragmatic DDD.
  - **Bounded Contexts**: Organize logic in `app/Core`.
  - **Application Layer**: Use `Action` classes for all business operations (e.g., `CreateProductAction`). Controllers MUST NOT contain business logic.
  - **Pure Domain**: Prefer Domain logic in pure PHP classes. Use Domain-specific exceptions.
  - **Repository Pattern**: ALL data access must go through Repository interfaces. Controllers MUST NOT query Eloquent models directly.
- **Notification Service**: MUST follow Hexagonal Architecture.
  - **Separation**: Distinguish between Domain (Template logic), Application (Use Cases), and Infrastructure (RabbitMQ, Mail, API Clients).
  - **Composition Root**: Use a centralized `index.js` for dependency injection and service bootstrapping.

## 📡 Messaging Standards
- Use **RabbitMQ** for all inter-service communication.
- Events MUST use `snake_case` for data keys to ensure cross-language compatibility.
- Implement the **Saga (Choreography)** pattern for eventual consistency.

## 🛠 Workflow
- **Docker First**: All services must be managed via `docker-compose.yml`.
- **Database Isolation**: Services MUST NEVER share a database.
- **API Access**: Use the defined ports (3000 for Nuxt, 3001 for Nest, 8000 for Laravel).

