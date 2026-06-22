# Developer Deep Dive: E-commerce DDD & Hexagonal Implementation

Granular architectural decisions, file responsibilities, and system design rationale.

---

## Why This Architecture?

### Hexagonal (Ports & Adapters) in NestJS
Used for **Order Service** and **Review Service** — transactional core where maximum decoupling is critical.
- **Domain**: Business rules with zero framework dependencies.
- **Adapters**: Swap PostgreSQL → anything by changing infrastructure layer only.
- **DI-native**: NestJS module/provider system makes ports/adapters path of least resistance.

### Pragmatic DDD in Laravel for Catalog
Laravel's speed comes from Eloquent. Fighting Active Record with strict Hexagonal creates over-engineering.
- **Bounded Contexts** under `app/Core/Catalog` prevent domain leaks.
- **Repository interface** + mapper bridges Eloquent ↔ pure domain models.
- **Use Cases** (`CreateProductAction`, `DeductStockUseCase`) keep controllers thin.

### Node.js Hexagonal (Identity, Payment, Shipping)
- Manual composition root in `index.js`.
- Domain entities (`User`, `Payment`, `Shipment`), repository interfaces, use cases.
- PostgreSQL via `pg` driver, RabbitMQ via `amqplib`.

---

## File-by-File Breakdown

### NestJS: Order Service + Review Service
| File | Responsibility |
|------|---------------|
| `domain/*.entity.ts` | Pure aggregate root. Zero framework imports. |
| `domain/*.repository.interface.ts` | Port: what domain needs from persistence. |
| `domain/ports/*.interface.ts` | Port: what domain needs from outside (e.g. message publisher). |
| `application/*.use-case.ts` | Orchestrates domain logic. Injected with ports. |
| `application/dtos/*.dto.ts` | Boundary contracts for input/output. |
| `infrastructure/persistence/*.repository.ts` | Adapter: implements repository port via TypeORM. |
| `infrastructure/persistence/*.mapper.ts` | Anti-corruption: ORM entity ↔ domain entity. |
| `infrastructure/persistence/*.orm-entity.ts` | TypeORM entity (DB schema). |
| `infrastructure/messaging/*.ts` | Adapter: RabbitMQ publisher/consumer. |

### Laravel: Catalog Service
| File | Responsibility |
|------|---------------|
| `Core/Catalog/Domain/Product.php` | Domain model with stock rules. Uses domain exceptions. |
| `Core/Catalog/Domain/ProductRepositoryInterface.php` | Port for persistence. |
| `Core/Catalog/Application/*UseCase.php` | Application logic (create, deduct, restock). |
| `Core/Catalog/Infrastructure/Persistence/*.php` | Eloquent adapter + mapper. |
| `Core/Catalog/Infrastructure/Messaging/*.php` | RabbitMQ publisher/consumer. |
| `Http/Controllers/ProductController.php` | HTTP interface only. Delegates to use cases. |

### Node.js: Identity, Payment, Shipping
| File | Responsibility |
|------|---------------|
| `domain/*.entity.js` | Domain object (plain JS class). |
| `domain/*.repository.js` | Interface contract (throws on unimplemented). |
| `application/*.use-case.js` | Business logic, orchestration. |
| `application/dtos/*.dto.js` | Input DTOs. |
| `infrastructure/persistence/*.repository.js` | PostgreSQL adapter. |
| `infrastructure/persistence/*.mapper.js` | Row ↔ domain mapper. |
| `infrastructure/messaging/*.js` | RabbitMQ consumer/publisher. |
| `interface/*.controller.js` | Express route handlers. |
| `index.js` | Composition root (wiring only). |

### Notification Service
| File | Responsibility |
|------|---------------|
| `domain/email-template.js` | Rich HTML email formatting. Pure. |
| `application/send-order-email.use-case.js` | Orchestrates catalog enrichment + email for `order.created`. |
| `application/send-shipped-email.use-case.js` | Shipping confirmation email for `order.shipped`. |
| `infrastructure/rabbitmq-consumer.js` | Listens for `order.created` and `order.shipped`. Dispatches by routing key. |
| `infrastructure/catalog-client.js` | Fetches product names via HTTP. |
| `infrastructure/mail-provider.js` | Nodemailer to Mailhog. |

---

## Messaging Strategy

### Choreography Saga (no orchestrator)
Each service reacts to events via RabbitMQ topic exchange `events`:

```
order.created       → Catalog (deduct stock), Payment (create pending), Notification (confirm email)
inventory.deducted  → Order (acknowledge)
inventory.insufficient → Order (cancel)
payment.completed   → Order (mark PAID), Shipping (create shipment)
payment.failed      → Order (cancel), Catalog (restock)
order.shipped       → Order (mark SHIPPED), Notification (shipped email)
```

### Durable queues per service
All queues are named and durable. Events survive consumer restarts. Exclusive queues avoided.

---

## Database Choices

| Service | DB | Rationale |
|---------|----|-----------|
| Order | PostgreSQL | JSONB for items, strict ACID |
| Catalog | MySQL | High-read workload, reliable |
| Identity | PostgreSQL | Shared infra with Order |
| Payment | PostgreSQL | Transactional integrity |
| Review | PostgreSQL | JSONB not needed, consistency |
| Shipping | PostgreSQL | Transactional |

Shared-nothing: services only communicate via RabbitMQ. No cross-service DB access.

---

## Key Patterns

### Repository + Mapper
Domain never sees ORM/DB objects. Mapper converts at boundary:
```
DB row → ORM Entity → Mapper → Domain Entity → Use Case
```

### Use Cases as single-responsibility entry points
Each use case takes a DTO, orchestrates domain logic, calls repositories/publishers, returns DTO.

### JWT Auth
Identity service issues JWT (payload: `{ id, email, role }`). Review service uses `JwtAuthGuard` to verify on `DELETE /reviews/:id`. Admin can delete any review; users can delete only their own.

### Manual composition root (Node.js services)
`index.js` instantiates all dependencies explicitly. No DI framework. Makes wiring visible and testable.
