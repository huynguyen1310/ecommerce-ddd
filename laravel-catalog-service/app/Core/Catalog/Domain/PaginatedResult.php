<?php

namespace App\Core\Catalog\Domain;

class PaginatedResult
{
    public function __construct(
        public readonly array $items,
        public readonly int $total,
        public readonly int $page,
        public readonly int $perPage,
        public readonly int $lastPage
    ) {}
}
