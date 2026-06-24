<?php

namespace App\Core\Catalog\Domain;

interface ShopRepositoryInterface
{
    public function save(Shop $shop): void;
    public function findById(string $id): ?Shop;
    public function findByOwnerId(string $ownerId): ?Shop;
    public function findBySlug(string $slug): ?Shop;
    public function findAll(): array;
    public function findByStatus(string $status): array;
}
