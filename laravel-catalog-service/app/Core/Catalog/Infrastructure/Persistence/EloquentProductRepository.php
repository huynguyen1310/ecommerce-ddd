<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Domain\PaginatedResult;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use App\Models\ProductEloquentModel;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function __construct(
        private ?MeilisearchProductIndex $searchIndex = null
    ) {}

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

        if ($this->searchIndex) {
            $this->searchIndex->sync($product);
        }
    }

    public function findBySku(string $sku): ?Product
    {
        $eloquent = ProductEloquentModel::where('sku', $sku)->first();
        return $eloquent ? ProductMapper::toDomain($eloquent) : null;
    }

    public function delete(string $id): void
    {
        ProductEloquentModel::destroy($id);

        if ($this->searchIndex) {
            $this->searchIndex->delete($id);
        }
    }

    public function findAll(int $page = 1, int $perPage = 12, ?string $search = null, ?string $category = null): PaginatedResult
    {
        if ($search && $this->searchIndex) {
            $ids = $this->searchIndex->searchIds($search, $category, $page, $perPage);
            $total = 0;

            if (!empty($ids)) {
                $query = ProductEloquentModel::whereIn('id', $ids)
                    ->orderByRaw('FIELD(id,' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')');
                $paginator = $query->paginate($perPage, ['*'], 'page', $page);
                $total = $paginator->total();
            } else {
                $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage, $page);
            }

            $items = collect($paginator->items())
                ->map(fn($eloquent) => ProductMapper::toDomain($eloquent))
                ->toArray();

            return new PaginatedResult(
                items: $items,
                total: $total,
                page: $page,
                perPage: $perPage,
                lastPage: max(1, (int) ceil($total / $perPage))
            );
        }

        $query = ProductEloquentModel::orderBy('name');

        if ($category) {
            $query->where('category', $category);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

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

    public function findAllCategories(): array
    {
        return ProductEloquentModel::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
    }
}
