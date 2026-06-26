<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Variant;
use App\Core\Catalog\Domain\VariantRepositoryInterface;
use App\Models\VariantEloquentModel;

class EloquentVariantRepository implements VariantRepositoryInterface
{
    public function save(Variant $variant): void
    {
        VariantEloquentModel::updateOrCreate(
            ['id' => $variant->id],
            [
                'product_id' => $variant->productId,
                'sku' => $variant->sku,
                'attributes' => $variant->attributes,
                'price' => $variant->price,
                'stock' => $variant->stock,
                'image_url' => $variant->imageUrl,
            ]
        );
    }

    public function findById(string $id): ?Variant
    {
        $e = VariantEloquentModel::find($id);
        return $e ? $this->map($e) : null;
    }

    public function findByProductId(string $productId): array
    {
        return VariantEloquentModel::where('product_id', $productId)
            ->orderBy('sku')
            ->get()
            ->map(fn($e) => $this->map($e))
            ->toArray();
    }

    public function findBySku(string $sku): ?Variant
    {
        $e = VariantEloquentModel::where('sku', $sku)->first();
        return $e ? $this->map($e) : null;
    }

    public function delete(string $id): void
    {
        VariantEloquentModel::destroy($id);
    }

    private function map($e): Variant
    {
        return new Variant(
            $e->id,
            $e->product_id,
            $e->sku,
            $e->attributes,
            $e->price !== null ? (float) $e->price : null,
            (int) $e->stock,
            $e->image_url,
        );
    }
}
