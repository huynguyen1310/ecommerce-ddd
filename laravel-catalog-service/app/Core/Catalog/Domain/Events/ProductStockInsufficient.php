<?php

namespace App\Core\Catalog\Domain\Events;

class ProductStockInsufficient implements DomainEvent
{
    private \DateTimeImmutable $occurredAt;

    public function __construct(
        public readonly string $productId,
        public readonly string $sku,
        public readonly int $requestedQuantity,
        public readonly int $availableStock
    ) {
        $this->occurredAt = new \DateTimeImmutable();
    }

    public function eventName(): string
    {
        return 'product.stock_insufficient';
    }

    public function occurredAt(): \DateTimeImmutable
    {
        return $this->occurredAt;
    }
}
