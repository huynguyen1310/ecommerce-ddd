<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TranslationEloquentModel extends Model
{
    protected $table = 'translations';
    protected $fillable = ['locale', 'key', 'value'];
}
