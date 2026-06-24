<?php

namespace App\Core\Catalog\Domain;

class Shop
{
    public function __construct(
        public readonly string $id,
        public readonly string $ownerId,
        public string $name,
        public string $slug,
        public ?string $description = null,
        public ?string $logoUrl = null,
        public string $status = 'pending',
        public ?string $createdAt = null,
        public ?string $updatedAt = null,
    ) {}
}
