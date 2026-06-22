<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\ProductRepositoryInterface;

class RestockProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private EventDispatcher $eventDispatcher
    ) {}

    public function execute(string $productId, int $quantity): void
    {
        $product = $this->productRepository->findById($productId);

        if (!$product) {
            throw new \RuntimeException("Product not found for restocking: {$productId}");
        }

        $product->setStock($product->stock + $quantity);
        $this->productRepository->save($product);

        foreach ($product->releaseEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }
    }
}
