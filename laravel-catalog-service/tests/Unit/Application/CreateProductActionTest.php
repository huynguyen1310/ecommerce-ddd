<?php

use App\Core\Catalog\Application\CreateProductAction;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

test('creates product with unique SKU', function () {
    $repo = $this->createMock(EloquentProductRepository::class);
    $repo->expects($this->once())->method('findBySku')->with('NEW-SKU')->willReturn(null);
    $repo->expects($this->once())->method('save');

    $action = new CreateProductAction($repo);
    $product = $action->execute('New Product', 'NEW-SKU', 19.99, 5);

    expect($product->name)->toBe('New Product');
    expect($product->sku)->toBe('NEW-SKU');
    expect($product->price)->toBe(19.99);
    expect($product->stock)->toBe(5);
    expect($product->id)->not->toBeNull();
});

test('throws when SKU already exists', function () {
    $existing = new Product('existing', 'Existing', 'DUP-SKU', 10, 1);
    $repo = $this->createMock(EloquentProductRepository::class);
    $repo->expects($this->once())->method('findBySku')->with('DUP-SKU')->willReturn($existing);

    $action = new CreateProductAction($repo);

    expect(fn () => $action->execute('Duplicate', 'DUP-SKU', 10, 1))
        ->toThrow(\RuntimeException::class, 'already exists');
});
