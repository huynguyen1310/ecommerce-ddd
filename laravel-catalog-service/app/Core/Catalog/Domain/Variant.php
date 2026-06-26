<?php

namespace App\Core\Catalog\Domain;

class Variant
{
    public function __construct(
        public readonly string $id,
        public readonly string $productId,
        public string $sku,
        public ?array $attributes = null,
        public ?float $price = null,
        public int $stock = 0,
        public ?string $imageUrl = null,
    ) {}

    public static function create(string $id, string $productId, string $sku, ?array $attributes = null, ?float $price = null, int $stock = 0, ?string $imageUrl = null): self
    {
        return new self($id, $productId, $sku, $attributes, $price, $stock, $imageUrl);
    }

    public function reduceStock(int $quantity): void
    {
        if ($this->stock < $quantity) {
            throw new \DomainException("Variant {$this->sku}: insufficient stock ({$this->stock} available, {$quantity} requested)");
        }
        $this->stock -= $quantity;
    }
}
