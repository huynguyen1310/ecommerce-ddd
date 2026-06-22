<?php

namespace App\Core\Catalog\Domain\Events;

class ProductStockReduced implements DomainEvent
{
    private \DateTimeImmutable $occurredAt;

    public function __construct(
        public readonly string $productId,
        public readonly string $sku,
        public readonly int $quantityReduced,
        public readonly int $remainingStock
    ) {
        $this->occurredAt = new \DateTimeImmutable();
    }

    public function eventName(): string
    {
        return 'product.stock_reduced';
    }

    public function occurredAt(): \DateTimeImmutable
    {
        return $this->occurredAt;
    }
}
