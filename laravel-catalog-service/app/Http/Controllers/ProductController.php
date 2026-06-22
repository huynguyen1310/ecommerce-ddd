<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Application\UpdateStockUseCase;
use App\Core\Catalog\Domain\Exceptions\SkuAlreadyExistsException;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private UpdateStockUseCase $updateStockUseCase,
        private \App\Core\Catalog\Application\CreateProductAction $createProductAction
    ) {}

    public function index(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 12);
        $result = $this->productRepository->findAll($page, $perPage);

        return response()->json([
            'data' => $result->items,
            'meta' => [
                'total' => $result->total,
                'page' => $result->page,
                'per_page' => $result->perPage,
                'last_page' => $result->lastPage,
            ],
        ]);
    }

    public function show(string $id)
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        return response()->json($product);
    }

    public function updateStock(Request $request, string $id)
    {
        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        try {
            $this->updateStockUseCase->execute($id, $request->stock);
            return response()->json(['message' => 'Stock updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'sku' => 'required|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
            ]);

            $product = $this->createProductAction->execute(
                $request->name,
                $request->sku,
                (float) $request->price,
                (int) $request->stock
            );

            return response()->json(['message' => 'Product created', 'id' => $product->id], 201);
        } catch (\Illuminate\Validation\ValidationException $v) {
            return response()->json(['error' => $v->errors()], 422);
        } catch (SkuAlreadyExistsException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $this->productRepository->delete($id);
        return response()->json(['message' => 'Product deleted']);
    }
}
