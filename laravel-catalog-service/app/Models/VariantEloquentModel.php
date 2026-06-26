<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VariantEloquentModel extends Model
{
    protected $table = 'product_variants';

    protected $fillable = [
        'id', 'product_id', 'sku', 'attributes', 'price', 'stock', 'image_url',
    ];

    protected $casts = [
        'attributes' => 'array',
        'price' => 'float',
        'stock' => 'integer',
    ];



    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;
}
