<?php

use App\Core\Catalog\Domain\Product;

test('creates product with given properties', function () {
    $product = new Product('p1', 'DDD Book', 'SKU-001', 45.00, 10);

    expect($product->id)->toBe('p1');
    expect($product->name)->toBe('DDD Book');
    expect($product->sku)->toBe('SKU-001');
    expect($product->price)->toBe(45.00);
    expect($product->stock)->toBe(10);
});

test('reduceStock deducts quantity', function () {
    $product = new Product('p1', 'Test', 'SKU', 10.00, 5);
    $product->reduceStock(3);

    expect($product->stock)->toBe(2);
});

test('reduceStock throws when stock too low', function () {
    $product = new Product('p1', 'Test', 'SKU', 10.00, 2);

    expect(fn () => $product->reduceStock(5))
        ->toThrow(\DomainException::class, 'insufficient stock');
});

test('reduceStock preserves stock on exception', function () {
    $product = new Product('p1', 'Test', 'SKU', 10.00, 2);

    try {
        $product->reduceStock(5);
    } catch (\DomainException) {}

    expect($product->stock)->toBe(2);
});

test('setStock sets exact quantity', function () {
    $product = new Product('p1', 'Test', 'SKU', 10.00, 5);
    $product->setStock(20);

    expect($product->stock)->toBe(20);
});

test('setStock throws when negative', function () {
    $product = new Product('p1', 'Test', 'SKU', 10.00, 5);

    expect(fn () => $product->setStock(-1))
        ->toThrow(Exception::class, 'Stock cannot be negative');
});
