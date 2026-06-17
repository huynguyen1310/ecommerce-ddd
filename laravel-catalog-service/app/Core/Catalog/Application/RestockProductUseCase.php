<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Domain\ProductRepositoryInterface;

class RestockProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(string $productId, int $quantity): void
    {
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \Exception("Product not found for restocking: {$productId}");
        }

        $product->setStock($product->stock + $quantity);
        $this->productRepository->save($product);
    }
}
