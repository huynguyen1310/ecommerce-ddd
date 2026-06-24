# E-commerce DDD & Hexagonal Architecture

Polyglot microservices — **DDD**, **Hexagonal (Ports & Adapters)**, **Event-Driven** choreography saga.

## Architecture

```mermaid
graph TB
  subgraph Frontend
    NUXT["Nuxt 3 SPA/SSR<br/>:3000"]
  end

  subgraph Gateway
    APIGW["API Gateway<br/>Express :8080"]
  end

  subgraph Backend
    ORDER["Order Service<br/>NestJS :3001"]
    CAT["Catalog Service<br/>Laravel :8000"]
    ID["Identity Service<br/>Express :3002"]
    PAY["Payment Service<br/>Express :3003"]
    RVW["Review Service<br/>NestJS :4000"]
    SHP["Shipping Service<br/>Express :4001"]
    NOTIF["Notification Service<br/>Node.js"]
  end

  subgraph Data
    RABBIT["RabbitMQ :5672"]
    MEILI["Meilisearch :7700"]
    MYSQL[("Catalog DB<br/>MySQL")]
    PG1[("Order DB<br/>PostgreSQL")]
    PG2[("Identity DB<br/>PostgreSQL")]
    PG3[("Payment DB<br/>PostgreSQL")]
    PG4[("Review DB<br/>PostgreSQL")]
    PG5[("Shipping DB<br/>PostgreSQL")]
  end

  NUXT --> APIGW
  APIGW --> ORDER & CAT & ID & PAY & RVW & SHP
  ORDER --> RABBIT
  CAT --> RABBIT & MEILI
  ID --> RABBIT
  PAY --> RABBIT
  SHP --> RABBIT
  NOTIF --> RABBIT
  RABBIT --> CAT & PAY & NOTIF & ORDER & SHP
  ORDER --> PG1
  CAT --> MYSQL
  ID --> PG2
  PAY --> PG3
  RVW --> PG4
  SHP --> PG5
```

## Services

| Service | Stack | DB | Port | Pattern |
|---------|-------|----|------|---------|
| **Order** | NestJS | PostgreSQL | 3001 | Strict Hexagonal |
| **Catalog** | Laravel | MySQL | 8000 | Pragmatic DDD |
| **Identity** | Express | PostgreSQL | 3002 | Hexagonal |
| **Payment** | Express | PostgreSQL | 3003 | Hexagonal |
| **Review** | NestJS | PostgreSQL | 4000 | Strict Hexagonal |
| **Shipping** | Express | PostgreSQL | 4001 | Hexagonal |
| **Notification** | Node.js | — | — | Hexagonal |
| **Frontend** | Nuxt 3 | — | 3000 | SPA/SSR |

## Saga Event Flow

```mermaid
sequenceDiagram
  participant F as Frontend
  participant O as Order
  participant R as RabbitMQ
  participant C as Catalog
  participant P as Payment
  participant N as Notification
  participant S as Shipping

  F->>O: POST /orders
  O->>R: publish order.created
  R-->>C: consume order.created
  R-->>P: consume order.created
  R-->>N: consume order.created
  C->>R: publish inventory.deducted/inventory.insufficient
  F->>P: POST pay
  P->>R: publish payment.completed / payment.failed
  R-->>O: consume payment.completed
  O->>R: publish order.shipped
  R-->>S: consume payment.completed
  S->>R: publish order.shipped
  R-->>N: consume order.shipped
```

## Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Catalog** | http://localhost:8000/api/products |
| **Order** | http://localhost:3001/orders |
| **Identity** | http://localhost:3002 (POST /register, /login) |
| **Payment** | http://localhost:3003/payments/:orderId |
| **Review** | http://localhost:4000/products/:id/reviews |
| **Shipping** | http://localhost:4001/shipments/:orderId |
| **RabbitMQ UI** | http://localhost:15672 (guest/guest) |
| **Mailhog UI** | http://localhost:8025 |

## Getting Started

```bash
docker compose up --build
```

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin` |
| **Vendor 1** (Shop One) | `vendor1@example.com` | `password` |
| **Vendor 2** (Shop Two) | `vendor2@example.com` | `password` |
| **Vendor 3** (Shop Three) | `vendor3@example.com` | `password` |

140 products pre-seeded, split across 3 shops (~40 each).

## Frontend Features

| Feature | Route | Description |
|---------|-------|-------------|
| **Home** | `/` | Product grid with search, staggered animation, "by Shop" links |
| **Shop Page** | `/shops/:id` | Shop profile with product grid |
| **Product** | `/products/:id` | Product detail with shop link, reviews |
| **Cart** | `/cart` | Items grouped by shop, checkbox selection per item/shop |
| **Checkout** | `/checkout` | Shipping form, coupon code, only selected items |
| **Orders** | `/orders` | Order history |
| **Wishlist** | `/wishlist` | localStorage-backed wishlist |
| **Admin Dashboard** | `/admin` | Shop approval only |
| **Vendor Dashboard** | `/vendor/dashboard` | Stock chart, low-stock alerts, product/orders/coupon links |
| **Vendor Products** | `/vendor/products` | Manage products, update stock |
| **Vendor Orders** | `/vendor/orders` | Incoming orders for your shop, mark shipped |
| **Vendor Coupons** | `/vendor/coupons` | Shop-scoped coupon codes |
| **Login/Register** | `/login`, `/register` | JWT auth |

## Email (MailHog)

All notification emails go to MailHog at **http://localhost:8025**.
Two emails per order: order confirmation + payment confirmation.

## Project Structure

```mermaid
graph LR
  subgraph Core
    DOMAIN["Domain<br/>Entities + Rules"]
    APP["Application<br/>Use Cases + DTOs"]
  end
  subgraph Infrastructure
    INFRA["Adapters<br/>DB / MQ / HTTP"]
  end
  subgraph Interface
    API["Controllers<br/>REST endpoints"]
  end
  API --> APP --> DOMAIN
  APP --> INFRA
  INFRA --> DB[(Database)] & MQ[(RabbitMQ)]
```

## Key Decisions

- **Hexagonal in NestJS**: DI-native, strict port/adapter separation
- **Pragmatic DDD in Laravel**: Bounded contexts under `app/Core/Catalog`, Eloquent speed without domain leaks
- **Node.js Hexagonal**: Manual composition root, domain entities, use cases
- **Choreography saga**: No orchestrator, each service reacts to events
- **Meilisearch**: Full-text search for catalog (lightweight alternative to Elasticsearch)
- **Shared-nothing**: Services communicate only through events
