<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductEloquentModel extends Model
{
    protected $table = 'products';
    protected $fillable = ['id', 'name', 'sku', 'price', 'stock', 'image_url', 'description', 'category'];
    public $incrementing = false;
    protected $keyType = 'string';
}
