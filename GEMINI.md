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

## 🏪 Multi-Vendor Marketplace Rules
- **Shop ownership**: Products, orders, and coupons are scoped to a shop. The shop's `owner_id` links to the vendor's user ID.
- **Coupon scope**: Coupons can optionally have a `shopId` — validation checks that the coupon's shop matches the request's `shopId`.
- **Order item shopId**: Each item in an order can optionally carry a `shopId`. This allows vendors to see only their items in multi-vendor orders.
- **Admin is not a vendor**: Admin users cannot become vendors. The "Become a Vendor" link is hidden from admins.
- **Admin scope**: Admin dashboard is only for shop approval. All operational features (products, orders, coupons) belong to the vendor dashboard.
- **Cart grouping**: Cart items are grouped by shop with checkbox selection. Only checked items proceed to checkout.

## 🛠 Workflow
- **Docker First**: All services must be managed via `docker-compose.yml`.
- **Database Isolation**: Services MUST NEVER share a database.
- **API Access**: Use the defined ports (3000 for Nuxt, 3001 for Nest, 8000 for Laravel).
- **Cart Service**: Stateless Express app backed by Redis. No build step — files are edited in place (`docker cp` + restart).
- **PHP Hot-Reload**: Laravel reads PHP files on each request. `docker cp` into the container is sufficient — no rebuild needed.
- **Seeds**: Identity service auto-seeds on boot (`initDb()`). Catalog service seeds via `php artisan db:seed`. Vendor UUIDs must match across services.
- **Bootstrap cache**: If `CollisionServiceProvider` error at boot, delete `bootstrap/cache/packages.php` and `services.php` (stale dev cache). Entrypoint.sh now auto-clears this.
- **Upload**: `POST /api/upload` requires JWT + native `fetch()` for FormData (Nuxt `$fetch` mishandles multipart).
- **Node 22+** required for Nuxt build (`styleText` in `node:util` missing in Node 18).
- **Meilisearch SDK v1.16**: Uses `getTotalHits()` not `getTotal()`. Index config via `php artisan meilisearch:setup`.
- **View tracking**: `POST /api/products/view` records product views in `product_views` table, cleaned >30d. Trending queries from this table.

