<?php

namespace App\Http\Controllers;

use App\Core\Catalog\Domain\ShopRepositoryInterface;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private EloquentProductRepository $productRepository,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:shops,name',
            'slug' => 'required|string|max:100|unique:shops,slug',
            'description' => 'nullable|string',
        ]);

        $user = $request->input('jwt_user');
        $existing = $this->shopRepository->findByOwnerId($user['id']);
        if ($existing) {
            return response()->json(['error' => 'You already have a shop'], 409);
        }

        $shop = new \App\Core\Catalog\Domain\Shop(
            (string) Str::uuid(),
            $user['id'],
            $request->name,
            $request->slug,
            $request->description,
        );

        $this->shopRepository->save($shop);

        return response()->json([
            'id' => $shop->id,
            'name' => $shop->name,
            'slug' => $shop->slug,
            'description' => $shop->description,
            'status' => $shop->status,
        ], 201);
    }

    public function my(Request $request): JsonResponse
    {
        $shop = $this->shopRepository->findByOwnerId($request->input('jwt_user.id'));
        if (!$shop) {
            return response()->json(null, 200);
        }
        return response()->json([
            'id' => $shop->id,
            'ownerId' => $shop->ownerId,
            'name' => $shop->name,
            'slug' => $shop->slug,
            'description' => $shop->description,
            'logoUrl' => $shop->logoUrl,
            'status' => $shop->status,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $shop = $this->shopRepository->findById($id);
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        return response()->json([
            'id' => $shop->id,
            'name' => $shop->name,
            'slug' => $shop->slug,
            'description' => $shop->description,
            'logoUrl' => $shop->logoUrl,
            'status' => $shop->status,
        ]);
    }

    public function adminAll(Request $request): JsonResponse
    {
        $user = $request->input('jwt_user');
        if (!$user || ($user['role'] ?? '') !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $status = $request->query('status');
        $shops = $status ? $this->shopRepository->findByStatus($status) : $this->shopRepository->findAll();
        return response()->json($shops);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $user = $request->input('jwt_user');
        if (!$user || ($user['role'] ?? '') !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $shop = $this->shopRepository->findById($id);
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }
        $shop->status = 'active';
        $this->shopRepository->save($shop);
        return response()->json(['message' => 'Shop approved']);
    }

    public function products(string $id): JsonResponse
    {
        $shop = $this->shopRepository->findById($id);
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $result = $this->productRepository->findAll(
            (int) request()->query('page', 1),
            (int) request()->query('per_page', 12),
            null,
            null,
            request()->query('sort', 'name'),
            request()->query('order', 'asc'),
            $id,
        );

        return response()->json([
            'shop' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'slug' => $shop->slug,
            ],
            'data' => $result['items'],
            'meta' => $result,
        ]);
    }
}
