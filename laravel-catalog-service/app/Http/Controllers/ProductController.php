<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Application\UpdateStockUseCase;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private EloquentProductRepository $productRepository,
        private UpdateStockUseCase $updateStockUseCase,
        private \App\Core\Catalog\Application\CreateProductAction $createProductAction
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->productRepository->findAll(
            (int) $request->query('page', 1),
            (int) $request->query('per_page', 12),
            $request->query('search'),
            $request->query('category')
        );

        return response()->json([
            'data' => $result['items'],
            'meta' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['perPage'],
                'last_page' => $result['lastPage'],
            ],
        ]);
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
        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'price' => $product->price,
            'stock' => $product->stock,
            'imageUrl' => $product->imageUrl,
            'description' => $product->description,
            'category' => $product->category,
        ]);
    }

    public function updateStock(Request $request, string $id): JsonResponse
    {
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
                (int) $request->stock
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
