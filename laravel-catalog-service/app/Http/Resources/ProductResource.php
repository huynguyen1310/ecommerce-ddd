<?php

namespace App\Http\Resources;

use App\Core\Catalog\Domain\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'sku' => $this->resource->sku,
            'price' => $this->resource->price,
            'stock' => $this->resource->stock,
            'imageUrl' => $this->resource->imageUrl,
            'description' => $this->resource->description,
            'category' => $this->resource->category,
        ];
    }
}
