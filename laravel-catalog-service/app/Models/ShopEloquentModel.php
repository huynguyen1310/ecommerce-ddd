<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopEloquentModel extends Model
{
    protected $table = 'shops';
    protected $fillable = ['id', 'owner_id', 'name', 'slug', 'description', 'logo_url', 'status'];
    public $incrementing = false;
    protected $keyType = 'string';
}
