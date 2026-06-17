# E-commerce DDD & Hexagonal Architecture Prototype

A polyglot microservices ecosystem demonstrating **Domain-Driven Design (DDD)**, **Hexagonal Architecture (Ports & Adapters)**, and **Event-Driven** communication.

## 🏗 System Architecture

The system is divided into bounded contexts, each utilizing different technologies suited for their specific responsibilities.

### 1. Order Service (NestJS)
- **Role**: Handles transactional order placement and status management.
- **Pattern**: Strict Hexagonal Architecture.
- **Layers**:
  - `Domain`: Pure business logic (Entities, Value Objects). No dependencies.
  - `Application`: Use Cases orchestrating domain logic.
  - `Infrastructure`: TypeORM (PostgreSQL) adapters, RabbitMQ Publishers/Consumers.
  - `Interface`: REST Controllers.

### 2. Catalog Service (Laravel)
- **Role**: Manages product inventory and stock deduction.
- **Pattern**: Modular DDD within Laravel.
- **Layers**:
  - `Core/Catalog/Domain`: Product aggregate and Repository interfaces.
  - `Core/Catalog/Application`: Use cases for stock management.
  - `Core/Catalog/Infrastructure`: Eloquent adapters and RabbitMQ listeners.
- **Worker**: A dedicated background process (`php artisan rabbitmq:consume-orders`) handles async events.

### 3. Notification Service (Node.js)
- **Role**: Purely reactive service for customer alerts.
- **Pattern**: Hexagonal Architecture.
- **Function**: Listens for `order.created` events, enriches data by fetching product names from the Catalog Service API, and sends emails via **Nodemailer** to **Mailhog**.

### 4. Frontend (Nuxt 3)
- **Role**: Modern SSR/SPA interface.
- **State Management**: Pinia stores for cart logic.

---

## 📡 Messaging & Event Flow (RabbitMQ)

The system uses a **Saga (Choreography)** pattern to ensure eventual consistency:

1. **`order.created`** (Topic: `order_events`):
   - **Source**: Order Service (NestJS)
   - **Consumer**: Catalog Service (Laravel)
   - **Action**: Locate product and deduct stock.

2. **`inventory.deducted`** (Topic: `order_events`):
   - **Source**: Catalog Service (Laravel)
   - **Consumer 1**: Order Service (NestJS) -> Update status to `SHIPPED`.
   - **Consumer 2**: Notification Service (Node) -> Send "Order Shipped" email.

3. **`inventory.insufficient`** (Topic: `order_events`):
   - **Source**: Catalog Service (Laravel)
   - **Consumer**: Order Service (NestJS) -> Update status to `CANCELLED`.

---

## 🛠 Tech Stack
- **Languages**: TypeScript (Node.js), PHP 8.2.
- **Databases**: PostgreSQL (Orders), MySQL (Catalog).
- **Broker**: RabbitMQ 3 (with Management UI).
- **Email Testing**: Mailhog.
- **Orchestration**: Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose.

### Installation
```bash
# 1. Clone/Navigate to the project
cd ecommerce-ddd-project

# 2. Start the entire stack
docker-compose up --build
```

### Access Points
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **RabbitMQ UI**: [http://localhost:15672](http://localhost:15672) (`guest`/`guest`)
- **Mailhog UI**: [http://localhost:8025](http://localhost:8025)
- **NestJS API**: [http://localhost:3001/orders](http://localhost:3001/orders)
- **Laravel API**: [http://localhost:8000](http://localhost:8000)

---

## 📝 Developer Notes
- **Persistence**: NestJS uses a **Mapper** pattern in the infrastructure layer to ensure DB entities never leak into the Domain.
- **Consistency**: Distributed transactions are handled via RabbitMQ. There is no direct DB sharing between services.
- **Seeding**: Laravel automatically seeds two test products on first boot via `entrypoint.sh`.
