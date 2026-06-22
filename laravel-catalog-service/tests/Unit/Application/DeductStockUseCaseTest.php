<?php

use App\Core\Catalog\Application\DeductStockUseCase;
use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Domain\Exceptions\InsufficientStockException;

test('deducts stock successfully', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 10);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);
    $repo->expects($this->once())->method('save');

    $dispatcher = $this->createMock(EventDispatcher::class);
    $dispatcher->expects($this->once())->method('dispatch');

    $useCase = new DeductStockUseCase($repo, $dispatcher);
    $useCase->execute('p1', 3);

    expect($product->stock)->toBe(7);
});

test('throws when product not found', function () {
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('missing')->willReturn(null);

    $dispatcher = $this->createMock(EventDispatcher::class);

    $useCase = new DeductStockUseCase($repo, $dispatcher);

    expect(fn () => $useCase->execute('missing', 1))
        ->toThrow(\RuntimeException::class, 'Product not found');
});

test('throws when insufficient stock', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 2);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);

    $dispatcher = $this->createMock(EventDispatcher::class);
    $dispatcher->expects($this->never())->method('dispatch');

    $useCase = new DeductStockUseCase($repo, $dispatcher);

    expect(fn () => $useCase->execute('p1', 10))
        ->toThrow(InsufficientStockException::class);
});
