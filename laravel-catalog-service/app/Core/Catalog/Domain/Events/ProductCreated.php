<?php

namespace App\Core\Catalog\Domain\Events;

use App\Core\Catalog\Domain\Product;

class ProductCreated implements DomainEvent
{
    private \DateTimeImmutable $occurredAt;

    public function __construct(
        public readonly Product $product
    ) {
        $this->occurredAt = new \DateTimeImmutable();
    }

    public function eventName(): string
    {
        return 'product.created';
    }

    public function occurredAt(): \DateTimeImmutable
    {
        return $this->occurredAt;
    }
}
