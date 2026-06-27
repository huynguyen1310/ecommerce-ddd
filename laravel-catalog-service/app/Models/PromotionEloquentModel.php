<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionEloquentModel extends Model
{
    protected $table = 'promotions';
    protected $fillable = ['id', 'shop_id', 'type', 'title', 'description', 'start_at', 'end_at', 'conditions', 'rewards', 'is_active'];
    protected $casts = [
        'conditions' => 'array',
        'rewards' => 'array',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
    ];
    public $incrementing = false;
    protected $keyType = 'string';

    public function scopeActive($q)
    {
        return $q->where('is_active', true)
            ->where('start_at', '<=', now())
            ->where('end_at', '>=', now());
    }
}
