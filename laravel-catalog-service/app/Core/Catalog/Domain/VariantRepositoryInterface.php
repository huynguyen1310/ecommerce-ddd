<?php

namespace App\Core\Catalog\Domain;

interface VariantRepositoryInterface
{
    public function save(Variant $variant): void;
    public function findById(string $id): ?Variant;
    public function findByProductId(string $productId): array;
    public function findBySku(string $sku): ?Variant;
    public function delete(string $id): void;
}
