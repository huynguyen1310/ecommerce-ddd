<?php

use App\Core\Catalog\Application\UpdateStockUseCase;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

test('sets stock to absolute value', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 5);
    $repo = $this->createMock(EloquentProductRepository::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);
    $repo->expects($this->once())->method('save');

    $useCase = new UpdateStockUseCase($repo);
    $useCase->execute('p1', 100);

    expect($product->stock)->toBe(100);
});

test('throws when product not found for stock update', function () {
    $repo = $this->createMock(EloquentProductRepository::class);
    $repo->expects($this->once())->method('findById')->with('missing')->willReturn(null);

    $useCase = new UpdateStockUseCase($repo);

    expect(fn () => $useCase->execute('missing', 50))
        ->toThrow(\RuntimeException::class, 'Product not found');
});
