<?php

namespace App\Core\Catalog\Domain;

use App\Core\Catalog\Domain\Events\DomainEvent;
use App\Core\Catalog\Domain\Events\ProductCreated;
use App\Core\Catalog\Domain\Events\ProductStockReduced;
use App\Core\Catalog\Domain\Events\ProductStockInsufficient;
use App\Core\Catalog\Domain\Exceptions\InsufficientStockException;

class Product
{
    /** @var DomainEvent[] */
    private array $recordedEvents = [];

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
        $product = new self($id, $name, $sku, $price, $stock, $imageUrl, $description, $category);
        $product->record(new ProductCreated($product));
        return $product;
    }

    public function reduceStock(int $quantity): void
    {
        if ($this->stock < $quantity) {
            $this->record(new ProductStockInsufficient($this->id, $this->sku, $quantity, $this->stock));
            throw new InsufficientStockException($this->sku, $quantity, $this->stock);
        }
        $this->stock -= $quantity;
        $this->record(new ProductStockReduced($this->id, $this->sku, $quantity, $this->stock));
    }

    public function setStock(int $newStock): void
    {
        if ($newStock < 0) {
            throw new \InvalidArgumentException("Stock cannot be negative");
        }
        $this->stock = $newStock;
    }

    /** @return DomainEvent[] */
    public function releaseEvents(): array
    {
        $events = $this->recordedEvents;
        $this->recordedEvents = [];
        return $events;
    }

    private function record(DomainEvent $event): void
    {
        $this->recordedEvents[] = $event;
    }

    public static function fromPersistence(string $id, string $name, string $sku, float $price, int $stock, ?string $imageUrl = null, ?string $description = null, ?string $category = null): self
    {
        return new self($id, $name, $sku, $price, $stock, $imageUrl, $description, $category);
    }
}
