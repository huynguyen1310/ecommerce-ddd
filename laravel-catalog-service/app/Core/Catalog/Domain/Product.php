<?php

namespace App\Core\Catalog\Domain;

class Product
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $sku,
        public readonly float $price,
        public int $stock,
        public readonly ?string $imageUrl = null,
        public readonly ?string $description = null,
        public readonly ?string $category = null
    ) {}

    public static function create(string $id, string $name, string $sku, float $price, int $stock, ?string $imageUrl = null, ?string $description = null, ?string $category = null): self
    {
        return new self($id, $name, $sku, $price, $stock, $imageUrl, $description, $category);
    }

    public function reduceStock(int $quantity): void
    {
        if ($this->stock < $quantity) {
            throw new \DomainException("Product {$this->sku}: insufficient stock ({$this->stock} available, {$quantity} requested)");
        }
        $this->stock -= $quantity;
    }

    public function setStock(int $newStock): void
    {
        if ($newStock < 0) {
            throw new \InvalidArgumentException("Stock cannot be negative");
        }
        $this->stock = $newStock;
    }
}
