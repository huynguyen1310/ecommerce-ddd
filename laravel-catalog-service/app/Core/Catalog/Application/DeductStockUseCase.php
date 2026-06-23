<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

class DeductStockUseCase
{
    public function __construct(
        private EloquentProductRepository $productRepository
    ) {}

    public function execute(string $productId, int $quantity): void
    {
        $product = $this->productRepository->findById($productId);

        if (!$product) {
            throw new \RuntimeException("Product not found");
        }

        $product->reduceStock($quantity);
        $this->productRepository->save($product);
    }
}
