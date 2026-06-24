<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Shop;
use App\Core\Catalog\Domain\ShopRepositoryInterface;
use App\Models\ShopEloquentModel;

class EloquentShopRepository implements ShopRepositoryInterface
{
    public function save(Shop $shop): void
    {
        ShopEloquentModel::updateOrCreate(
            ['id' => $shop->id],
            [
                'owner_id' => $shop->ownerId,
                'name' => $shop->name,
                'slug' => $shop->slug,
                'description' => $shop->description,
                'logo_url' => $shop->logoUrl,
                'status' => $shop->status,
            ]
        );
    }

    public function findById(string $id): ?Shop
    {
        $eloquent = ShopEloquentModel::find($id);
        if (!$eloquent) return null;
        return $this->map($eloquent);
    }

    public function findByOwnerId(string $ownerId): ?Shop
    {
        $eloquent = ShopEloquentModel::where('owner_id', $ownerId)->first();
        if (!$eloquent) return null;
        return $this->map($eloquent);
    }

    public function findBySlug(string $slug): ?Shop
    {
        $eloquent = ShopEloquentModel::where('slug', $slug)->first();
        if (!$eloquent) return null;
        return $this->map($eloquent);
    }

    public function findAll(): array
    {
        return ShopEloquentModel::orderBy('name')->get()->map(fn($e) => $this->map($e))->toArray();
    }

    public function findByStatus(string $status): array
    {
        return ShopEloquentModel::where('status', $status)->orderBy('created_at', 'desc')->get()->map(fn($e) => $this->map($e))->toArray();
    }

    private function map($e): Shop
    {
        return new Shop($e->id, $e->owner_id, $e->name, $e->slug, $e->description, $e->logo_url, $e->status, $e->created_at, $e->updated_at);
    }
}
