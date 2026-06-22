<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Application\UpdateStockUseCase;
use App\Core\Catalog\Domain\Exceptions\SkuAlreadyExistsException;
use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private UpdateStockUseCase $updateStockUseCase,
        private \App\Core\Catalog\Application\CreateProductAction $createProductAction
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 12);
        $search = $request->query('search');
        $category = $request->query('category');

        $result = $this->productRepository->findAll($page, $perPage, $search, $category);

        return response()->json([
            'data' => ProductResource::collection($result->items),
            'meta' => [
                'total' => $result->total,
                'page' => $result->page,
                'per_page' => $result->perPage,
                'last_page' => $result->lastPage,
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
        return response()->json(new ProductResource($product));
    }

    public function updateStock(UpdateStockRequest $request, string $id): JsonResponse
    {
        try {
            $this->updateStockUseCase->execute($id, $request->stock);
            return response()->json(['message' => 'Stock updated successfully']);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function store(CreateProductRequest $request): JsonResponse
    {
        try {
            $product = $this->createProductAction->execute(
                $request->name,
                $request->sku,
                (float) $request->price,
                (int) $request->stock
            );

            return response()->json([
                'message' => 'Product created',
                'id' => $product->id,
            ], 201);
        } catch (SkuAlreadyExistsException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $this->productRepository->delete($id);
        return response()->json(['message' => 'Product deleted']);
    }
}
