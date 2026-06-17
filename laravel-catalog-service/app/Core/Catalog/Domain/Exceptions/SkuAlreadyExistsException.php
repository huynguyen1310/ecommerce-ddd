<?php

namespace App\Core\Catalog\Domain\Exceptions;

class SkuAlreadyExistsException extends \DomainException
{
    public function __construct(string $sku)
    {
        parent::__construct("Product with SKU {$sku} already exists in the catalog");
    }
}
