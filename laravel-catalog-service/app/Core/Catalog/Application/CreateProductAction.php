<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use Illuminate\Support\Str;

class CreateProductAction
{
    public function __construct(
        private EloquentProductRepository $productRepository
    ) {}

    public function execute(string $name, string $sku, float $price, int $stock): Product
    {
        $existing = $this->productRepository->findBySku($sku);
        if ($existing) {
            throw new \RuntimeException("Product with SKU {$sku} already exists");
        }

        $product = Product::create(
            (string) Str::uuid(),
            $name,
            $sku,
            $price,
            $stock
        );

        $this->productRepository->save($product);

        return $product;
    }
}
