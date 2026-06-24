<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Application\UpdateStockUseCase;
use App\Core\Catalog\Domain\ShopRepositoryInterface;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private EloquentProductRepository $productRepository,
        private UpdateStockUseCase $updateStockUseCase,
        private \App\Core\Catalog\Application\CreateProductAction $createProductAction,
        private ShopRepositoryInterface $shopRepository,
    ) {}

    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        if (strlen($query) < 2) {
            return response()->json([]);
        }
        return response()->json($this->productRepository->suggest($query));
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->productRepository->findAll(
            (int) $request->query('page', 1),
            (int) $request->query('per_page', 12),
            $request->query('search'),
            $request->query('category'),
            $request->query('sort', 'name'),
            $request->query('order', 'asc'),
            $request->query('shop_id'),
        );

        $shopIds = array_unique(array_filter(array_map(fn($p) => $p->shopId, $result['items'])));
        $shops = !empty($shopIds) ? \App\Models\ShopEloquentModel::whereIn('id', $shopIds)->get()->keyBy('id') : collect();

        $data = array_map(function ($p) use ($shops) {
            $item = [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => $p->price,
                'stock' => $p->stock,
                'imageUrl' => $p->imageUrl,
                'description' => $p->description,
                'category' => $p->category,
                'shopId' => $p->shopId,
            ];
            if ($p->shopId && $shops->has($p->shopId)) {
                $s = $shops->get($p->shopId);
                $item['shop'] = ['id' => $s->id, 'name' => $s->name];
            }
            return $item;
        }, $result['items']);

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['perPage'],
                'last_page' => $result['lastPage'],
            ],
        ]);
    }

    public function related(Request $request, string $id): JsonResponse
    {
        $product = $this->productRepository->findById($id);
        if (!$product || !$product->category) return response()->json([]);
        return response()->json($this->productRepository->findByCategory($product->category, $id, (int) $request->query('limit', 8)));
    }

    public function categories(): JsonResponse
    {
        return response()->json($this->productRepository->findAllCategories());
    }

    public function show(string $id): JsonResponse
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $shop = null;
        if ($product->shopId) {
            $s = $this->shopRepository->findById($product->shopId);
            if ($s) {
                $shop = ['id' => $s->id, 'name' => $s->name, 'slug' => $s->slug];
            }
        }

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'price' => $product->price,
            'stock' => $product->stock,
            'imageUrl' => $product->imageUrl,
            'description' => $product->description,
            'category' => $product->category,
            'shop' => $shop,
        ]);
    }

    public function updateStock(Request $request, string $id): JsonResponse
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        if ($product->shopId) {
            $shop = $this->shopRepository->findById($product->shopId);
            if (!$shop || $shop->ownerId !== $request->input('jwt_user.id')) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }
        try {
            $this->updateStockUseCase->execute($id, (int) $request->stock);
            return response()->json(['message' => 'Stock updated successfully']);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $product = $this->createProductAction->execute(
                $request->name,
                $request->sku,
                (float) $request->price,
                (int) $request->stock,
                $request->shop_id,
            );
            return response()->json(['message' => 'Product created', 'id' => $product->id], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $this->productRepository->delete($id);
        return response()->json(['message' => 'Product deleted']);
    }
}
