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
        return $this->map($eloquent);
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
                'shop_id' => $product->shopId,
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
        return $this->map($eloquent);
    }

    public function delete(string $id): void
    {
        ProductEloquentModel::destroy($id);
        if ($this->searchIndex) {
            $this->searchIndex->delete($id);
        }
    }

    public function suggest(string $query): array
    {
        if (!$this->searchIndex) return [];
        return $this->searchIndex->suggest($query);
    }

    public function findAll(int $page = 1, int $perPage = 12, ?string $search = null, ?string $category = null, string $sort = 'name', string $order = 'asc', ?string $shopId = null): array
    {
        if ($search && $this->searchIndex) {
            $ids = $this->searchIndex->searchIds($search, $category, $page, $perPage);
            if (!empty($ids)) {
                $query = ProductEloquentModel::whereIn('id', $ids)
                    ->orderByRaw('FIELD(id,' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')');
                if ($shopId) $query->where('shop_id', $shopId);
                $paginator = $query->paginate($perPage, ['*'], 'page', $page);
            } else {
                $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage, $page);
            }
        } else {
            $query = ProductEloquentModel::orderBy($sort, $order);
            if ($category) $query->where('category', $category);
            if ($shopId) $query->where('shop_id', $shopId);
            $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        }

        return [
            'items' => collect($paginator->items())->map(fn($e) => $this->map($e))->toArray(),
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
            'lastPage' => $paginator->lastPage(),
        ];
    }

    public function findByCategory(string $category, string $excludeId = '', int $limit = 8): array
    {
        $query = ProductEloquentModel::where('category', $category);
        if ($excludeId) $query->where('id', '!=', $excludeId);
        return $query->limit($limit)->get()->map(fn($e) => $this->map($e))->toArray();
    }

    public function findByShopId(string $shopId): array
    {
        return ProductEloquentModel::where('shop_id', $shopId)->orderBy('name')->get()->map(fn($e) => $this->map($e))->toArray();
    }

    public function findAllCategories(): array
    {
        return ProductEloquentModel::select('category')
            ->distinct()->whereNotNull('category')->orderBy('category')
            ->pluck('category')->toArray();
    }

    private function map($e): Product
    {
        return new Product($e->id, $e->name, $e->sku, (float) $e->price, (int) $e->stock, $e->image_url, $e->description, $e->category, $e->shop_id);
    }
}
