# E-Commerce DDD Project

## Stack
- **Frontend:** Nuxt 3 (Vue 3, Pinia, Tailwind CSS, TypeScript) :3000
- **API Gateway:** Express.js (JWT auth, route proxying) :8080
- **Catalog Service:** Laravel 11 (PHP 8.2, MySQL) :8000
- **Order Service:** NestJS (TypeORM, PostgreSQL) :3001
- **Other Services:** User (Express/PG) :3002, Payment (Express/PG) :3003, Cart (Express/Redis) :3004, Review (NestJS/PG) :4000, Shipping (Express/PG) :4001, Notification (Node/RabbitMQ/Express/PG) :4002
- **Search:** Meilisearch v1.12 :7700
- **Broker:** RabbitMQ (topic exchange `events`)
- **Storage:** RustFS (S3-compatible) :9005
- **Email:** MailHog :1025 SMTP / :8025 UI
- **Infra:** Docker Compose (20 containers, `ecom-network` bridge)

## Architecture
- **Polyglot DDD**: Each service uses the best-fit architecture:
  - **NestJS services** (Order, Review) → Strict Hexagonal (Ports & Adapters) with pure Domain layer, DTOs, mappers
  - **Laravel** (Catalog) → Pragmatic DDD: `app/Core/Catalog/{Domain,Application,Infrastructure}`, Repository pattern, Use Cases
  - **Node.js services** (User, Payment, Shipping) → Manual Hexagonal via composition root, `pg` driver, domain entities
- **Services NEVER share a database** — cross-service queries use REST or events
- **Shops live in catalog MySQL** (tightly coupled to products)

## Key Endpoints

### Gateway (all routes go through :8080)

| Prefix | Upstream | Auth |
|--------|----------|------|
| `/api/products*` | catalog-service:9000 | Partial (GET public, POST/PATCH/DELETE varies) |
| `/shops*` | catalog-service:9000/api | GET public, POST/PATCH jwt.auth |
| `/cart*` | cart-service:3004 | Public |
| `/orders*` | order-service:3000 | Public |
| `/payments*` | payment-service:3003 | Public |
| `/reviews*` | review-service:4000 | Public |
| `/products/:id/reviews` | review-service:4000 | Public |
| `/products/:id/related` | catalog-service:9000 | Public |
| `/chat*` | user-service:3002 | Public |
| `/login`, `/register` | user-service:3002 | Public |
| `/users*` | user-service:3002 | Public |
| `/coupons*` | order-service:3000 | Public |
| `/shipments*` | shipping-service:4001 | Public |
| `/storage*` | rustfs:9000 | Public |
| `/api/upload` | catalog-service:9000 | jwt.auth |
| `/notifications*` | notification-service:4002 | Public |

### Catalog Service (Laravel)

**Search & Discovery:**
- `GET /api/products/autocomplete?q=` — Meilisearch suggest (id, name, price, imageUrl, shop_name, in_stock)
- `GET /api/products/search?q=&category=&min_price=&max_price=&in_stock=&shop_id=&sort=&page=&per_page=` — faceted full-text search with SQL fallback
- `GET /api/products/trending?limit=20` — most viewed in 7 days (product_views table)
- `GET /api/products/new-arrivals?limit=20` — latest products
- `GET /api/products/recommended?productId=&limit=12` — same category + price range ±50%
- `GET /api/products/recently-viewed?user_id=&limit=20` — user's view history
- `POST /api/products/view` — `{user_id, product_id}` — records view, cleans up >30d
- `GET /api/products/categories` — distinct category list
- `GET /api/products/{id}/related?limit=8` — same category, excludes current

**CRUD:**
- `GET /api/products?page=&per_page=&search=&category=&sort=&order=&shop_id=`
- `GET /api/products/{id}`
- `POST /api/products` — create
- `PATCH /api/products/{id}` — update
- `PATCH /api/products/{id}/stock`
- `DELETE /api/products/{id}`

**Variants:**
- `GET /api/products/{productId}/variants`
- `POST /api/products/{productId}/variants`
- `PATCH /api/products/{productId}/variants/{variantId}`
- `DELETE /api/products/{productId}/variants/{variantId}`

**Shops:**
- `GET /shops/{id}`
- `GET /shops/{id}/products`
- `POST /shops` — create (jwt.auth)
- `GET /shops/my` — current user's shop (jwt.auth)
- `GET /shops/admin/all` — admin only
- `PATCH /shops/admin/{id}/approve`

**Upload:**
- `POST /api/upload` — multipart file upload, returns `{url, filename}` (jwt.auth)

### Notification (Express/PG on :4002)
- `GET /notifications?user_id=&page=` — paginated in-app notifications
- `GET /notifications/unread-count?user_id=` — unread badge count
- `PATCH /notifications/:id/read` — mark single as read
- `POST /notifications/read-all` — mark all read (`{user_id}`)
- Listens on `events` exchange for `order.created`, `refund.created` → creates notification row + sends email

### Order Service (NestJS)
- `POST /orders` — create order, publishes `order.created`
- `GET /orders`, `GET /orders/:id`
- `GET /orders/customer/:customerId`
- `GET /orders/vendor/:shopId`
- `PATCH /orders/:id/status`, `PATCH /orders/:id/ship`, `PATCH /orders/:id/confirm-delivery`
- `POST /orders/:id/return`, `PATCH /orders/:id/return/approve|reject`
- `POST /coupons/validate`, `GET /coupons`, `POST /coupons`
- Admin: auto-deliver, auto-complete, force-refund

### User Service (Express)
- `POST /register`, `POST /login`
- `POST /become-vendor`
- `GET /users/me`, `PATCH /users/shop`
- `GET /chat/unread-count`, `/chat/conversations`, `/chat/:shopId`, `POST /chat/:shopId`

### Cart Service (Express/Redis)
- `GET /cart/:userId`
- `POST /cart/:userId/items` — `{productId, variantId?, quantity, shopId, shopName}`
- `PATCH /cart/:userId/items/:productId` — update qty (0 = remove)
- `DELETE /cart/:userId/items/:productId`
- `DELETE /cart/:userId` — clear cart

## Frontend Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.vue` | Trending Now, New Arrivals, Recently Viewed sections + catalog grid |
| `/search?q=&category=` | `pages/search.vue` | Faceted search (category, price range, in-stock) + sort + pagination |
| `/products/[id]` | `pages/products/[id].vue` | Product detail, image carousel, variants, reviews, related, view tracking |
| `/shops/[id]` | `pages/shops/[id].vue` | Shop profile + products |
| `/cart` | `pages/cart.vue` | Grouped by shop, checkbox selection, qty controls |
| `/checkout` | `pages/checkout/index.vue` | Shipping form, coupon, checkout |
| `/orders` | `pages/orders/index.vue` | Order history |
| `/orders/[id]` | `pages/orders/[id].vue` | Order detail + tracking |
| `/login`, `/register` | — | Auth forms |
| `/profile` | — | User profile |
| `/wishlist` | — | Wishlist (localStorage) |
| `/messages` | — | Chat inbox |
| `/admin/index` | — | Admin: shop approval, returns, orders |
| `/vendor/dashboard` | — | Vendor dashboard with low-stock alerts, chart |
| `/vendor/products` | — | Product list with search/sort/pagination |
| `/vendor/products/create` | — | Create product with multi-image upload, variants |
| `/vendor/products/[id]` | — | Edit product, image carousel, variant CRUD |
| `/vendor/orders` | — | Vendor orders, mark shipped |
| `/vendor/coupons` | — | Coupon management |
| `/vendor/returns` | — | Return requests |
| `/vendor/create` | — | Shop creation form |

## Meilisearch

- **Index:** `products`
- **Searchable:** `name, description, sku, category`
- **Filterable:** `category, price, in_stock, shop_id`
- **Sortable:** `price, name, created_at`
- **Document:** id, name, description, category, sku, price, imageUrl, images, shop_id, shop_name, in_stock, stock, created_at
- **Commands:** `php artisan meilisearch:setup`, `php artisan meilisearch:reindex`

## Database Tables

### MySQL (catalog_service)
- `products` — id (UUID), name, sku (unique), price, stock, image_url, images (JSON), description, category, shop_id (FK), timestamps
- `shops` — id (UUID), owner_id, name (unique), slug (unique), description, logo_url, status (default 'pending'), timestamps
- `product_variants` — id (UUID), product_id (FK), sku (unique), attributes (JSON), price, stock, image_url, timestamps
- `product_views` — id (auto), user_id, product_id (FK), viewed_at. Indexed on (user_id, viewed_at), (product_id, viewed_at). Cleaned >30d.

### PostgreSQL (order_service)
- `orders` — id, customerId, items (JSONB), status, total, shippingAddress, couponCode, discount, createdAt
- `sub_orders` — id, orderId, shopId, status, total, items, trackingNumber, carrier, shippedAt, deliveredAt
- `return_requests` — id, orderId, shopId, buyerId, reason, status, refundAmount
- `coupons` — id, code (unique), discountType, discountValue, minOrderAmount, maxUses, usedCount, expiresAt, shopId

### PostgreSQL (others)
- `user_service`: `users`, `chat_messages`
- `payment_service`: `payments`
- `shipping_service`: `shipments`
- `review_service`: `reviews`
- `notification_service`: `notifications` (id, user_id, type, title, body, link, is_read, created_at)

### Redis (cart_service)
- `cart:{userId}` (Hash) — key: `productId[:variantId]`, value: JSON product

## RabbitMQ Events

**Exchange:** `events` (topic, durable)

| Event | Publisher | Consumers |
|-------|-----------|-----------|
| order.created | Order | Catalog (deduct stock), Payment (create payment), Notification (email) |
| inventory.deducted | Catalog (worker) | Order (acknowledge) |
| inventory.insufficient | Catalog (worker) | Order (cancel order) |
| payment.completed | Payment | Order (confirm), Shipping (create shipment), Notification (email) |
| payment.failed | Payment | Order (cancel), Catalog (restock) |
| order.shipped | Shipping | Order (update status), Notification (email) |
| refund.created | Order | Notification (email) |
| refund.completed | Order | Catalog (restock), Notification (email) |

## Saga Flow
1. Frontend → POST /orders → Order creates + publishes order.created
2. Catalog worker deducts stock → publishes inventory.deducted / inventory.insufficient
3. Payment creates PENDING record
4. Frontend → POST /payments/:orderId/process → Payment publishes payment.completed / payment.failed
5. On success: Shipping creates shipment → publishes order.shipped → Notification emails tracking
6. On failure: Order cancels, Catalog restocks, Notification emails failure

## Seed Accounts
| Email | Password | Role | Shop |
|-------|----------|------|------|
| admin@example.com | admin | admin | — |
| vendor1@example.com | password | vendor | Shop One |
| vendor2@example.com | password | vendor | Shop Two |
| vendor3@example.com | password | vendor | Shop Three |

## Key Files

### Backend
- `laravel-catalog-service/app/Http/Controllers/ProductController.php` — all product CRUD + search/discovery endpoints
- `laravel-catalog-service/app/Core/Catalog/Infrastructure/Persistence/EloquentProductRepository.php` — searchWithFilters, trending, newArrivals, recommended, recordView, recentlyViewed
- `laravel-catalog-service/app/Core/Catalog/Infrastructure/Search/MeilisearchProductIndex.php` — Meilisearch search/suggest/sync
- `laravel-catalog-service/app/Console/Commands/MeilisearchSetup.php` — index config (filterable/sortable)
- `laravel-catalog-service/app/Console/Commands/ConsumeOrderEvents.php` — RabbitMQ consumer (stock mgmt)
- `api-gateway/src/gateway.js` — all routes, auth middleware, CORS

### Frontend
- `frontend-nuxt/layouts/default.vue` — nav with search autocomplete, auth menu, badges
- `frontend-nuxt/layouts/vendor.vue` — sidebar layout for vendor pages
- `frontend-nuxt/pages/index.vue` — homepage with discovery sections
- `frontend-nuxt/pages/search.vue` — faceted search
- `frontend-nuxt/pages/products/[id].vue` — product detail with view tracking
- `frontend-nuxt/pages/vendor/products/index.vue` — vendor product management
- `frontend-nuxt/pages/vendor/products/create.vue` — create product with multi-image upload
- `frontend-nuxt/pages/vendor/products/[id].vue` — edit product, variant CRUD
- `frontend-nuxt/pages/notifications.vue` — in-app notification list with mark read
- `notification-service/src/infrastructure/notification-repository.js` — PG repository for notifications
- `notification-service/index.js` — composition root with Express HTTP server + REST endpoints

### Stores
- `stores/auth.ts` — login, register, logout, localStorage persistence
- `stores/cart.ts` — fetchCart, addToCart (variant support), updateQuantity, checkout
- `stores/notifications.ts` — toast queue with auto-dismiss
- `stores/notification.ts` — in-app notification fetch, mark read, unread count polling
- `stores/wishlist.ts` — localStorage-backed, max 12 items
- `stores/recentlyViewed.ts` — localStorage-backed, max 12 items

## Workflow Notes
- **PHP hot-reload:** Laravel reads files on each request. `docker cp` into container is sufficient — no rebuild needed.
- **Cart Service:** Stateless Express/Redis — edit `cart-service/index.js`, `docker cp` + restart.
- **Node 22+ required** for Nuxt build (`styleText` in `node:util` missing in Node 18).
- **Upload:** `POST /api/upload` accepts multipart `file`. Use native `fetch()` for FormData (Nuxt `$fetch` mishandles multipart). Requires JWT auth header forwarded through gateway.
- **Bootstrap cache:** If `CollisionServiceProvider` errors at boot, delete `bootstrap/cache/packages.php` and `services.php` (stale dev cache).

## What Was Recently Done (Phase 10 — In-App Notifications)

### Backend
- PostgreSQL container (`notification-db`) added to docker-compose on :5437
- `NotificationRepository` with auto-migrate, CRUD, unread count, mark-read
- Express HTTP server in `notification-service/index.js` with 4 REST endpoints
- RabbitMQ consumer expanded to create in-app notification records for `order.created` (via `customer_id`) and `refund.created` (via `buyer_id`)
- Gateway routes added for `/notifications*` → notification-service:4002

### Frontend
- `stores/notification.ts` — Pinia store with fetch, unread polling, mark-read
- Bell icon in nav (SVG logged-in only) with unread badge, polls every 10s
- `/notifications` page with unread/read styling, "Mark all as read", deep-link navigation

### Backend
- Expanded Meilisearch index with `shop_name, in_stock, stock, shop_id, created_at` fields
- Added filterable attrs: `category, price, in_stock, shop_id`
- Added sortable attrs: `price, name, created_at`
- New repository methods: `searchWithFilters()`, `trending()`, `newArrivals()`, `recommended()`, `recordView()`, `recentlyViewed()`
- All discovery endpoints have SQL fallback when Meilisearch unavailable
- `product_views` migration (id, user_id, product_id FK, viewed_at, indexes, 30d cleanup)
- Normalized response format (shop name) across all discovery endpoints
- Gateway: made `POST /api/products/view` public

### Frontend
- Search bar in nav with autocomplete dropdown (Meilisearch suggest, debounced, OOS badge)
- Full search results page with faceted sidebar (category, price range, in-stock), mobile filter drawer, sort, pagination
- Homepage discovery sections: Trending Now, New Arrivals, Recently Viewed (horizontal scroll)
- Product detail page records views via `POST /api/products/view`
- Entrypoint.sh clears stale bootstrap cache before migrations
- Fixed `bootstrap/cache/` stale CollisionServiceProvider refs

### Edge Cases Handled
- Meilisearch down → SQL `LIKE` fallback for search, `trending()` falls back to `newArrivals()`
- MySQL strict mode → `recentlyViewed()` uses `GROUP BY + MAX(viewed_at)` instead of `DISTINCT + ORDER BY`
- SDK compatibility → `getTotal()` → `getTotalHits()` (Meilisearch PHP SDK v1.16)
- Empty view data → trending shows new arrivals
- Unknown user → recently viewed returns empty array
- Short autocomplete queries (<2 chars) → empty response
- product_views cleanup → auto-delete records >30 days old
- Out-of-stock products → OOS badge in autocomplete, overlay on search grid
