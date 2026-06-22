<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\PaginatedResult;
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

    public function findAll(int $page = 1, int $perPage = 12): PaginatedResult
    {
        $paginator = ProductEloquentModel::orderBy('name')->paginate($perPage, ['*'], 'page', $page);

        $items = collect($paginator->items())
            ->map(fn($eloquent) => ProductMapper::toDomain($eloquent))
            ->toArray();

        return new PaginatedResult(
            items: $items,
            total: $paginator->total(),
            page: $paginator->currentPage(),
            perPage: $paginator->perPage(),
            lastPage: $paginator->lastPage()
        );
    }
}
