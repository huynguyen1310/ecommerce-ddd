<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

class UpdateStockUseCase
{
    public function __construct(
        private EloquentProductRepository $productRepository
    ) {}

    public function execute(string $productId, int $newStock): void
    {
        $product = $this->productRepository->findById($productId);

        if (!$product) {
            throw new \RuntimeException("Product not found");
        }

        $product->setStock($newStock);
        $this->productRepository->save($product);
    }
}
