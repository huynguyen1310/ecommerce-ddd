<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Domain\ProductRepositoryInterface;

class UpdateStockUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(string $productId, int $newStock): void
    {
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \Exception("Product not found");
        }

        // We'll add a setStock method to Product domain entity
        $product->setStock($newStock);
        $this->productRepository->save($product);
    }
}
