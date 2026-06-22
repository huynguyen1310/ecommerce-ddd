<?php

use App\Core\Catalog\Domain\Exceptions\InsufficientStockException;

test('includes sku, requested, available in message', function () {
    $e = new InsufficientStockException('SKU-001', 10, 3);

    expect($e->getMessage())->toContain('SKU-001');
    expect($e->getMessage())->toContain('10');
    expect($e->getMessage())->toContain('3');
    expect($e)->toBeInstanceOf(DomainException::class);
});
