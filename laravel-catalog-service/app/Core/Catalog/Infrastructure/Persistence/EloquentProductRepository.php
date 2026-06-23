<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use App\Models\ProductEloquentModel;

class EloquentProductRepository
{
    public function __construct(
        private ?MeilisearchProductIndex $searchIndex = null
    ) {}

    public function findById(string $id): ?Product
    {
        $eloquent = ProductEloquentModel::find($id);
        if (!$eloquent) return null;
        return new Product($eloquent->id, $eloquent->name, $eloquent->sku, (float) $eloquent->price, (int) $eloquent->stock, $eloquent->image_url, $eloquent->description, $eloquent->category);
    }

    public function save(Product $product): void
    {
        ProductEloquentModel::updateOrCreate(
            ['id' => $product->id],
            [
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock,
                'image_url' => $product->imageUrl,
                'description' => $product->description,
                'category' => $product->category,
            ]
        );

        if ($this->searchIndex) {
            $this->searchIndex->sync($product);
        }
    }

    public function findBySku(string $sku): ?Product
    {
        $eloquent = ProductEloquentModel::where('sku', $sku)->first();
        if (!$eloquent) return null;
        return new Product($eloquent->id, $eloquent->name, $eloquent->sku, (float) $eloquent->price, (int) $eloquent->stock, $eloquent->image_url, $eloquent->description, $eloquent->category);
    }

    public function delete(string $id): void
    {
        ProductEloquentModel::destroy($id);
        if ($this->searchIndex) {
            $this->searchIndex->delete($id);
        }
    }

    public function findAll(int $page = 1, int $perPage = 12, ?string $search = null, ?string $category = null): array
    {
        if ($search && $this->searchIndex) {
            $ids = $this->searchIndex->searchIds($search, $category, $page, $perPage);
            if (!empty($ids)) {
                $query = ProductEloquentModel::whereIn('id', $ids)
                    ->orderByRaw('FIELD(id,' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')');
                $paginator = $query->paginate($perPage, ['*'], 'page', $page);
            } else {
                $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage, $page);
            }
        } else {
            $query = ProductEloquentModel::orderBy('name');
            if ($category) $query->where('category', $category);
            $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return [
            'items' => collect($paginator->items())->map(fn($e) => new Product($e->id, $e->name, $e->sku, (float) $e->price, (int) $e->stock, $e->image_url, $e->description, $e->category))->toArray(),
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
            'lastPage' => $paginator->lastPage(),
        ];
    }

    public function findAllCategories(): array
    {
        return ProductEloquentModel::select('category')
            ->distinct()->whereNotNull('category')->orderBy('category')
            ->pluck('category')->toArray();
    }
}
