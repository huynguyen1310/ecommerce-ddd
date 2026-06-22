# E-commerce DDD & Hexagonal Architecture Prototype

Polyglot microservices ecosystem demonstrating **Domain-Driven Design (DDD)**, **Hexagonal Architecture (Ports & Adapters)**, and **Event-Driven** communication via choreography saga.

## Services

| Service | Stack | DB | Port | Pattern |
|---------|-------|----|------|---------|
| **Order** | NestJS | PostgreSQL | 3001 | Strict Hexagonal |
| **Catalog** | Laravel | MySQL | 8000 | Pragmatic DDD |
| **Identity** | Node.js (Express) | PostgreSQL | 3002 | Hexagonal |
| **Payment** | Node.js (Express) | PostgreSQL | 3003 | Hexagonal |
| **Notification** | Node.js | — | — | Hexagonal |
| **Review** | NestJS | PostgreSQL | 4000 | Strict Hexagonal |
| **Shipping** | Node.js (Express) | PostgreSQL | 4001 | Hexagonal |
| **Frontend** | Nuxt 3 | — | 3000 | SPA/SSR |

## Saga Event Flow

```
order.created
  → Catalog: deduct stock → inventory.deducted / inventory.insufficient
  → Payment: create PENDING payment entry
  → Notification: send order confirmation email

payment.completed (user clicks Pay)
  → Order: status → PAID
  → Shipping: create shipment, publish order.shipped

order.shipped
  → Order: status → SHIPPED
  → Notification: send shipped email with tracking

payment.failed
  → Order: status → CANCELLED
  → Catalog: restock items
```

## Access Points

- **Frontend**: http://localhost:3000
- **RabbitMQ UI**: http://localhost:15672 (`guest`/`guest`)
- **Mailhog UI**: http://localhost:8025
- **Order API**: http://localhost:3001/orders
- **Catalog API**: http://localhost:8000/api/products
- **Identity API**: http://localhost:3002 (POST /register, POST /login)
- **Payment API**: http://localhost:3003/payments/:orderId
- **Review API**: http://localhost:4000/products/:id/reviews
- **Shipping API**: http://localhost:4001/shipments/:orderId

## Getting Started

```bash
docker compose up --build
```

Default admin: `admin@example.com` / `admin`

## Key Architectural Decisions

- **Hexagonal in NestJS** for Order + Review: DI-native framework, strict port/adapter separation, mappers keep domain pure.
- **Pragmatic DDD in Laravel** for Catalog: bounded contexts under `app/Core/Catalog`, leverages Eloquent speed while preventing domain leaks.
- **Hexagonal in Node.js** for Identity/Payment/Shipping: domain entities, use cases, repository pattern, manual composition root.
- **Choreography saga** via RabbitMQ topics: no orchestrator, each service reacts to events. Temporal decoupling.
- **No direct DB sharing**: services communicate only through events. Shared-nothing per service.
