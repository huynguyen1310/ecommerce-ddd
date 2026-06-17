<?php

namespace App\Core\Catalog\Domain\Exceptions;

class InsufficientStockException extends \DomainException
{
    public function __construct(string $sku, int $requested, int $available)
    {
        parent::__construct(
            "Product {$sku}: insufficient stock ({$available} available, {$requested} requested)"
        );
    }
}
