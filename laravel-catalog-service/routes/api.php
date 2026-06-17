<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
