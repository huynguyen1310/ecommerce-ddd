<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\ProductRepositoryInterface;

class UpdateStockUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private EventDispatcher $eventDispatcher
    ) {}

    public function execute(string $productId, int $newStock): void
    {
        $product = $this->productRepository->findById($productId);

        if (!$product) {
            throw new \RuntimeException("Product not found");
        }

        $product->setStock($newStock);
        $this->productRepository->save($product);

        foreach ($product->releaseEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }
    }
}
