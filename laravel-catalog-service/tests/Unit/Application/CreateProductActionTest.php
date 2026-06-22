<?php

use App\Core\Catalog\Application\CreateProductAction;
use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Domain\Exceptions\SkuAlreadyExistsException;

test('creates product with unique SKU', function () {
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findBySku')->with('NEW-SKU')->willReturn(null);
    $repo->expects($this->once())->method('save');

    $dispatcher = $this->createMock(EventDispatcher::class);
    $dispatcher->expects($this->once())->method('dispatch');

    $action = new CreateProductAction($repo, $dispatcher);
    $product = $action->execute('New Product', 'NEW-SKU', 19.99, 5);

    expect($product->name)->toBe('New Product');
    expect($product->sku)->toBe('NEW-SKU');
    expect($product->price)->toBe(19.99);
    expect($product->stock)->toBe(5);
    expect($product->id)->not->toBeNull();
});

test('throws when SKU already exists', function () {
    $existing = new Product('existing', 'Existing', 'DUP-SKU', 10, 1);
    $repo = $this->createMock(ProductRepositoryInterface::class);
    $repo->expects($this->once())->method('findBySku')->with('DUP-SKU')->willReturn($existing);

    $dispatcher = $this->createMock(EventDispatcher::class);

    $action = new CreateProductAction($repo, $dispatcher);

    expect(fn () => $action->execute('Duplicate', 'DUP-SKU', 10, 1))
        ->toThrow(SkuAlreadyExistsException::class);
});
