# Developer Deep Dive: E-commerce DDD & Hexagonal Implementation

This document provides a granular explanation of the architectural decisions, file responsibilities, and the rationale behind the system design.

---

## 🏗 Why This Architecture?

### 1. Hexagonal Architecture (Ports & Adapters) - *Used in NestJS*
**Reasoning**: We chose this for the **Order Service** because it is the most critical part of the business.
- **The Core (Domain)**: Contains business rules that never change regardless of whether we use PostgreSQL, MongoDB, or an external API.
- **The Adapters (Infrastructure)**: If we decide to move from PostgreSQL to another DB, we only change the `Infrastructure` layer. The business logic remains untouched and untested.

### 2. Domain-Driven Design (DDD) - *Used in Laravel*
**Reasoning**: Laravel is often used for rapid development, but it can become a "Big Ball of Mud." By introducing **Bounded Contexts** (inside `app/Core`), we prevent the Catalog logic from leaking into unrelated parts of the app.
- **Aggregates**: The `Product` model ensures that stock can only be reduced through its own methods, protecting data integrity.

---

## ⚖️ Purity vs. Practicality: Why the different styles?

A common question is: *Why not use the same strict architecture for both?* We chose to match the architecture to the framework's native strengths.

### NestJS: The "Strict" Hexagonal Choice
NestJS is built on Dependency Injection (DI) and is heavily inspired by Angular. It is designed for "Enterprise" patterns.
- **Natural Fit**: The framework's `module` and `provider` system makes "Ports and Adapters" the path of least resistance.
- **Purity**: Because NestJS doesn't ship with a mandatory ORM, we can enforce a "Domain First" approach where business logic has zero knowledge of the database.

### Laravel: The "Pragmatic" DDD Choice
Laravel's greatest strength is its **Eloquent ORM** and developer velocity.
- **Avoiding "Framework Friction"**: Implementing strict Hexagonal in Laravel often means fighting against its most powerful features (Active Record). This can lead to over-engineering.
- **Focus on Boundaries**: Instead of strict "purity," we focus on **Bounded Contexts**. By moving logic into `app/Core/Catalog`, we get the organizational benefits of DDD while still leveraging Laravel's speed.

**Summary**: We use **Strict Hexagonal** in NestJS for the core transactional service (Orders) to ensure maximum decoupling. We use **Pragmatic DDD** in Laravel for the supporting service (Catalog) to maintain high development velocity.

---

## 📂 File-by-File Breakdown

### 1. NestJS: Order Service
| File | Responsibility | Why? |
| :--- | :--- | :--- |
| `domain/order.entity.ts` | The Aggregate Root. | Houses pure state and logic for an Order. Completely dependency-free. |
| `domain/ports/*.ts` | Boundary Interfaces. | Defines *what* the domain needs (Repositories, Publishers) without knowing *how* it's implemented. |
| `application/dtos/*.ts` | Data Transfer Objects. | Defines strict contracts for data entering and leaving the Application layer. |
| `infrastructure/persistence/order.mapper.ts` | Data Transformer. | Converts DB-specific objects (ORM Entities) into pure Domain objects. |

### 2. Laravel: Catalog Service
| File | Responsibility | Why? |
| :--- | :--- | :--- |
| `app/Core/Catalog/Domain/Product.php` | Domain Model. | A pure PHP class handling stock rules. Uses Domain Exceptions (e.g., `InsufficientStockException`). |
| `app/Core/Catalog/Application/CreateProductAction.php` | Application Logic. | Orchestrates the creation of products, separating business rules from HTTP controllers. |
| `app/Http/Controllers/ProductController.php` | HTTP Interface. | Strictly handles request/response. Delegates all business logic to Application Actions. |

---

## ✉️ The Notification Service Design

The Notification Service has been upgraded from a simple script to a **Hexagonal Architecture** to ensure long-term maintainability.

- **Domain**: Contains `EmailTemplate` logic, which is the core business value of this service.
- **Application**: The `SendOrderEmailUseCase` orchestrates the process: fetching product names, formatting the template, and sending the mail.
- **Infrastructure**: Contains adapters for:
  - `RabbitMQConsumer`: Listens for events.
  - `CatalogClient`: Fetches product details via HTTP.
  - `MailProvider`: Sends emails via Nodemailer.
- **Composition Root**: `index.js` wires all dependencies together.

---

## 📡 Messaging Strategy (The "Why")

We use **Asynchronous Messaging** instead of REST for inter-service calls:
- **Temporal Decoupling**: If the Laravel service is offline for 5 minutes, the NestJS service can still take orders. The messages will just wait in RabbitMQ until Laravel comes back online.
- **Choreography vs Orchestration**: We don't have a "Master" service telling everyone what to do. Instead, each service "reacts" to events. This makes the system more flexible—you can add a new `Analytics Service` that listens to `order.created` without changing a single line of code in the Order Service.

---

## 🛠 Database Choice Rationale
- **PostgreSQL (Orders)**: Better for complex JSON (Order items) and strict ACID compliance.
- **MySQL (Catalog)**: Standard, highly reliable for high-read scenarios like product browsing.
- **Shared-Nothing Architecture**: Notice that Laravel **cannot** see the NestJS database. They only talk via RabbitMQ. This is crucial for true microservices.
