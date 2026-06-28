<?php

namespace App\Core\Catalog\Domain;

class Product
{
    public function __construct(
        public readonly string $id,
        public string $name,
        public readonly string $sku,
        public float $price,
        public int $stock,
        public ?string $imageUrl = null,
        public ?string $description = null,
        public ?string $category = null,
        public readonly ?string $shopId = null,
        public array $images = [],
        public ?array $translations = null,
    ) {}

    public static function create(string $id, string $name, string $sku, float $price, int $stock, ?string $imageUrl = null, ?string $description = null, ?string $category = null, ?string $shopId = null, array $images = [], ?array $translations = null): self
    {
        return new self($id, $name, $sku, $price, $stock, $imageUrl, $description, $category, $shopId, $images, $translations);
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
