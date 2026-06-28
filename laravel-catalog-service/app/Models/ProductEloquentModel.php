<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductEloquentModel extends Model
{
    protected $table = 'products';
    protected $fillable = ['id', 'name', 'sku', 'price', 'stock', 'image_url', 'description', 'category', 'shop_id', 'translations'];
    protected $casts = [
        'translations' => 'array',
    ];
    public $incrementing = false;
    protected $keyType = 'string';
}
