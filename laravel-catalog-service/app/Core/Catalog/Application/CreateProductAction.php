<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Domain\Exceptions\SkuAlreadyExistsException;
use Illuminate\Support\Str;

class CreateProductAction
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(string $name, string $sku, float $price, int $stock): Product
    {
        $existing = $this->productRepository->findBySku($sku);
        if ($existing) {
            throw new SkuAlreadyExistsException($sku);
        }

        $product = new Product(
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
