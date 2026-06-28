<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use App\Models\ProductEloquentModel;
use App\Models\ShopEloquentModel;
use Illuminate\Support\Facades\DB;

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
                'images' => !empty($product->images) ? json_encode($product->images) : null,
                'description' => $product->description,
                'category' => $product->category,
                'shop_id' => $product->shopId,
                'translations' => $product->translations,
            ]
        );

        if ($this->searchIndex) {
            $shopName = null;
            if ($product->shopId) {
                $shop = ShopEloquentModel::find($product->shopId);
                $shopName = $shop?->name;
            }
            $this->searchIndex->sync($product, $shopName);
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

    /** @return array{hits: array, total: int, page: int, perPage: int} */
    public function searchWithFilters(string $query, array $filters = [], string $sort = '', int $page = 1, int $perPage = 20): array
    {
        if ($this->searchIndex) {
            return $this->searchIndex->search($query, $filters, $sort, $page, $perPage);
        }
        $q = ProductEloquentModel::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('description', 'like', "%{$query}%")
              ->orWhere('sku', 'like', "%{$query}%");
        });
        if (!empty($filters['category'])) $q->where('category', $filters['category']);
        if (isset($filters['min_price'])) $q->where('price', '>=', $filters['min_price']);
        if (isset($filters['max_price'])) $q->where('price', '<=', $filters['max_price']);
        if (!empty($filters['in_stock'])) $q->where('stock', '>', 0);
        if (!empty($filters['shop_id'])) $q->where('shop_id', $filters['shop_id']);
        if ($sort) {
            [$field, $dir] = explode(':', $sort);
            $q->orderBy($field, $dir);
        }
        $paginator = $q->paginate($perPage, ['*'], 'page', $page);
        return [
            'hits' => $paginator->items(),
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
        ];
    }

    public function trending(int $limit = 20): array
    {
        $ids = DB::table('product_views')
            ->select('product_id', DB::raw('COUNT(*) as views'))
            ->where('viewed_at', '>=', now()->subDays(7))
            ->groupBy('product_id')
            ->orderByDesc('views')
            ->limit($limit)
            ->pluck('product_id')
            ->toArray();

        if (empty($ids)) {
            return $this->newArrivals($limit);
        }

        $products = ProductEloquentModel::whereIn('id', $ids)
            ->orderByRaw('FIELD(id,' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')')
            ->get()
            ->map(fn($e) => $this->map($e))
            ->toArray();

        // Pad with new arrivals if not enough trending products
        if (count($products) < $limit) {
            $existingIds = array_map(fn($p) => $p->id, $products);
            $fallback = ProductEloquentModel::whereNotIn('id', $existingIds)
                ->orderByDesc('created_at')
                ->limit($limit - count($products))
                ->get()
                ->map(fn($e) => $this->map($e))
                ->toArray();
            $products = array_merge($products, $fallback);
        }

        return $products;
    }

    public function newArrivals(int $limit = 20): array
    {
        return ProductEloquentModel::orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($e) => $this->map($e))
            ->toArray();
    }

    public function recommended(string $productId, int $limit = 12): array
    {
        $product = $this->findById($productId);
        if (!$product || !$product->category) {
            return $this->newArrivals($limit);
        }

        $price = $product->price;
        $minPrice = $price * 0.5;
        $maxPrice = $price * 1.5;

        return ProductEloquentModel::where('id', '!=', $productId)
            ->where('category', $product->category)
            ->whereBetween('price', [$minPrice, $maxPrice])
            ->inRandomOrder()
            ->limit($limit)
            ->get()
            ->map(fn($e) => $this->map($e))
            ->toArray();
    }

    public function recordView(string $userId, string $productId): void
    {
        DB::table('product_views')->insert([
            'user_id' => $userId,
            'product_id' => $productId,
            'viewed_at' => now(),
        ]);

        // Keep only recent data — archive older than 30 days
        DB::table('product_views')
            ->where('viewed_at', '<', now()->subDays(30))
            ->delete();
    }

    public function recentlyViewed(string $userId, int $limit = 20): array
    {
        $ids = DB::table('product_views')
            ->where('user_id', $userId)
            ->select('product_id')
            ->selectRaw('MAX(viewed_at) as latest_view')
            ->groupBy('product_id')
            ->orderByDesc('latest_view')
            ->limit($limit)
            ->pluck('product_id')
            ->toArray();

        if (empty($ids)) return [];

        return ProductEloquentModel::whereIn('id', $ids)
            ->orderByRaw('FIELD(id,' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')')
            ->get()
            ->map(fn($e) => $this->map($e))
            ->toArray();
    }

    private function map($e): Product
    {
        return new Product($e->id, $e->name, $e->sku, (float) $e->price, (int) $e->stock, $e->image_url, $e->description, $e->category, $e->shop_id, json_decode($e->images ?? '[]', true) ?? [], $e->translations);
    }
}
