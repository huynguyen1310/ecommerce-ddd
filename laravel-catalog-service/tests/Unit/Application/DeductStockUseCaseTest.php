<?php

use App\Core\Catalog\Application\DeductStockUseCase;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Domain\Exceptions\InsufficientStockException;

test('deducts stock successfully', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 10);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);
    $repo->expects($this->once())->method('save');

    $useCase = new DeductStockUseCase($repo);
    $useCase->execute('p1', 3);

    expect($product->stock)->toBe(7);
});

test('throws when product not found', function () {
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('missing')->willReturn(null);

    $useCase = new DeductStockUseCase($repo);

    expect(fn () => $useCase->execute('missing', 1))
        ->toThrow(Exception::class, 'Product not found');
});

test('throws when insufficient stock', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 2);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);

    $useCase = new DeductStockUseCase($repo);

    expect(fn () => $useCase->execute('p1', 10))
        ->toThrow(InsufficientStockException::class);
});
