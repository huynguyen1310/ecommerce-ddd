<?php

namespace App\Core\Catalog\Infrastructure\Persistence;

use App\Core\Catalog\Domain\Product;
use App\Models\ProductEloquentModel;

class ProductMapper
{
    public static function toDomain(ProductEloquentModel $eloquent): Product
    {
        return new Product(
            $eloquent->id,
            $eloquent->name,
            $eloquent->sku,
            (float) $eloquent->price,
            (int) $eloquent->stock,
            $eloquent->image_url,
            $eloquent->description,
            $eloquent->category
        );
    }

    public static function toPersistence(Product $domain): array
    {
        return [
            'id' => $domain->id,
            'name' => $domain->name,
            'sku' => $domain->sku,
            'price' => $domain->price,
            'stock' => $domain->stock,
            'image_url' => $domain->imageUrl,
            'description' => $domain->description,
            'category' => $domain->category,
        ];
    }
}
