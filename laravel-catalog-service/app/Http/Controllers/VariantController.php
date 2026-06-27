<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Domain\Variant;
use App\Core\Catalog\Domain\VariantRepositoryInterface;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use App\Core\Catalog\Infrastructure\Persistence\EloquentShopRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VariantController extends Controller
{
    public function __construct(
        private VariantRepositoryInterface $variantRepository,
        private EloquentProductRepository $productRepository,
        private EloquentShopRepository $shopRepository,
    ) {}

    public function index(string $productId): JsonResponse
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        $variants = $this->variantRepository->findByProductId($productId);
        return response()->json(['data' => $variants]);
    }

    private function ensureShopActive(Request $request, string $shopId): ?\Illuminate\Http\JsonResponse
    {
        $shop = $this->shopRepository->findById($shopId);
        if (!$shop || $shop->ownerId !== $request->input('jwt_user.id')) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        if ($shop->status === 'suspended') {
            return response()->json(['error' => 'Shop is suspended'], 403);
        }
        return null;
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        if ($product->shopId) {
            $forbidden = $this->ensureShopActive($request, $product->shopId);
            if ($forbidden) return $forbidden;
        }

        $existing = $this->variantRepository->findBySku($request->sku);
        if ($existing) {
            return response()->json(['error' => "SKU {$request->sku} already exists"], 422);
        }

        $variant = Variant::create(
            (string) Str::uuid(),
            $productId,
            $request->sku,
            $request->attributes,
            $request->price !== null ? (float) $request->price : null,
            (int) ($request->stock ?? 0),
            $request->image_url,
        );

        $this->variantRepository->save($variant);
        return response()->json(['message' => 'Variant created', 'id' => $variant->id], 201);
    }

    public function update(Request $request, string $productId, string $variantId): JsonResponse
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        if ($product->shopId) {
            $forbidden = $this->ensureShopActive($request, $product->shopId);
            if ($forbidden) return $forbidden;
        }

        $variant = $this->variantRepository->findById($variantId);
        if (!$variant || $variant->productId !== $productId) {
            return response()->json(['error' => 'Variant not found'], 404);
        }

        if ($request->has('sku') && $request->sku !== $variant->sku) {
            $existing = $this->variantRepository->findBySku($request->sku);
            if ($existing) return response()->json(['error' => "SKU {$request->sku} already exists"], 422);
        }

        $attrs = $variant->attributes;
        if ($request->has('sku')) $variant->sku = $request->sku;
        if ($request->has('attributes')) $variant->attributes = $request->attributes;
        if ($request->has('price')) $variant->price = (float) $request->price;
        if ($request->has('stock')) $variant->stock = (int) $request->stock;
        if ($request->has('image_url')) $variant->imageUrl = $request->image_url;

        $this->variantRepository->save($variant);
        return response()->json(['message' => 'Variant updated']);
    }

    public function destroy(Request $request, string $productId, string $variantId): JsonResponse
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        if ($product->shopId) {
            $forbidden = $this->ensureShopActive($request, $product->shopId);
            if ($forbidden) return $forbidden;
        }

        $this->variantRepository->delete($variantId);
        return response()->json(['message' => 'Variant deleted']);
    }
}
