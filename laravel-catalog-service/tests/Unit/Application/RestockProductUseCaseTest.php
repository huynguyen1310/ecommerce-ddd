<?php

use App\Core\Catalog\Application\RestockProductUseCase;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;

test('restocks product by adding quantity', function () {
    $product = new Product('p1', 'Test', 'SKU', 10, 5);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('p1')->willReturn($product);
    $repo->expects($this->once())->method('save');

    $useCase = new RestockProductUseCase($repo);
    $useCase->execute('p1', 10);

    expect($product->stock)->toBe(15);
});

test('throws when product not found for restock', function () {
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findById')->with('missing')->willReturn(null);

    $useCase = new RestockProductUseCase($repo);

    expect(fn () => $useCase->execute('missing', 5))
        ->toThrow(Exception::class, 'Product not found for restocking: missing');
});
