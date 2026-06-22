<?php

namespace App\Core\Catalog\Domain;

interface ProductRepositoryInterface
{
    public function findById(string $id): ?Product;
    public function save(Product $product): void;
    public function findBySku(string $sku): ?Product;
    public function delete(string $id): void;
    public function findAll(int $page = 1, int $perPage = 12, ?string $search = null, ?string $category = null): PaginatedResult;
    /** @return string[] */
    public function findAllCategories(): array;
}
