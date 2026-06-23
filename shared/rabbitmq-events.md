# RabbitMQ Event Schema Definitions

Standard JSON payloads for cross-service communication.

## Event Flow

```mermaid
graph TB
  O[Order Service] -->|order.created| R[RabbitMQ<br/>Topic: events]
  R --> C[Catalog Worker]
  R --> P[Payment Service]
  R --> N[Notification Service]

  C -->|inventory.deducted| R
  C -->|inventory.insufficient| R
  R --> O

  F[Frontend] -->|POST pay| P
  P -->|payment.completed| R
  P -->|payment.failed| R
  R --> O
  R --> S[Shipping Service]
  R --> N
  R --> C

  S -->|order.shipped| R
  R --> O
  R --> N
```

## 1. Order Service Events

### `order.created`
- **Source**: NestJS (Order Service)
- **Target**: Laravel (Catalog Service), Payment Service, Notification Service
- **Routing Key**: `order.created`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "customer_id": "uuid",
    "customer_email": "user@example.com",
    "ordered_at": "ISO8601",
    "shipping_address": {
      "name": "Jane Doe",
      "street": "123 Main St",
      "city": "NYC",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    },
    "items": [
      {
        "product_id": "uuid",
        "quantity": 1,
        "price": 100.00
      }
    ],
    "total": 100.00
  }
}
```

## 2. Catalog Service Events

### `inventory.deducted`
- **Source**: Laravel (Catalog Service)
- **Target**: Order Service (to update order status to 'SHIPPED')
- **Routing Key**: `inventory.deducted`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "product_id": "uuid",
    "quantity_deducted": 1,
    "remaining_stock": 49
  }
}
```

### `inventory.insufficient`
- **Source**: Laravel (Catalog Service)
- **Target**: Order Service (to cancel order)
- **Routing Key**: `inventory.insufficient`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "product_id": "uuid",
    "quantity_requested": 1,
    "available_stock": 0
  }
}
```

## 3. Payment Service Events

### `payment.completed`
- **Source**: Payment Service
- **Target**: Order Service, Shipping Service, Notification Service
- **Routing Key**: `payment.completed`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "transaction_id": "TXN-XXXXXXXX",
    "status": "SUCCESS",
    "customer_email": "user@example.com",
    "shipping_address": {
      "name": "Jane Doe",
      "street": "123 Main St",
      "city": "NYC",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    }
  }
}
```

### `payment.failed`
- **Source**: Payment Service
- **Target**: Order Service, Catalog Service
- **Routing Key**: `payment.failed`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "reason": "User cancelled or payment failed",
    "items": [{ "product_id": "uuid", "quantity": 1 }]
  }
}
```

## 4. Shipping Service Events

### `order.shipped`
- **Source**: Shipping Service
- **Target**: Order Service, Notification Service
- **Routing Key**: `order.shipped`
- **Payload**:
```json
{
  "event_id": "uuid",
  "occurred_at": "ISO8601",
  "data": {
    "order_id": "uuid",
    "tracking_number": "TRK123456789",
    "carrier": "FedEx"
  }
}
```
