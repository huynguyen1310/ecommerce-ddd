<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Models\ProductEloquentModel;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function findById(string $id): ?Product
    {
        $eloquent = ProductEloquentModel::find($id);
        return $eloquent ? ProductMapper::toDomain($eloquent) : null;
    }

    public function save(Product $product): void
    {
        ProductEloquentModel::updateOrCreate(
            ['id' => $product->id],
            ProductMapper::toPersistence($product)
        );
    }

    public function findBySku(string $sku): ?Product
    {
        $eloquent = ProductEloquentModel::where('sku', $sku)->first();
        return $eloquent ? ProductMapper::toDomain($eloquent) : null;
    }

    public function delete(string $id): void
    {
        ProductEloquentModel::destroy($id);
    }

    public function findAll(): array
    {
        return ProductEloquentModel::all()
            ->map(fn($eloquent) => ProductMapper::toDomain($eloquent))
            ->toArray();
    }
}
