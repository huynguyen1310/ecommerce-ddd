<?php

namespace App\Core\Catalog\Application;

use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Domain\Exceptions\SkuAlreadyExistsException;
use Illuminate\Support\Str;

class CreateProductAction
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private EventDispatcher $eventDispatcher
    ) {}

    public function execute(string $name, string $sku, float $price, int $stock): Product
    {
        $existing = $this->productRepository->findBySku($sku);
        if ($existing) {
            throw new SkuAlreadyExistsException($sku);
        }

        $product = Product::create(
            (string) Str::uuid(),
            $name,
            $sku,
            $price,
            $stock
        );

        $this->productRepository->save($product);

        foreach ($product->releaseEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return $product;
    }
}
