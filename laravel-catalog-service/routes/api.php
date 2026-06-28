<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VariantController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\LocaleController;

Route::get('/locales', [LocaleController::class, 'locales']);
Route::get('/translations', [LocaleController::class, 'translations']);
Route::post('/translations/bulk', [LocaleController::class, 'upsert'])->middleware('jwt.auth');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/autocomplete', [ProductController::class, 'autocomplete']);
Route::get('/products/trending', [ProductController::class, 'trending']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/recommended', [ProductController::class, 'recommended']);
Route::get('/products/recently-viewed', [ProductController::class, 'recentlyViewed']);
Route::post('/products/view', [ProductController::class, 'recordView']);
Route::get('/products/{id}/related', [ProductController::class, 'related']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);
Route::patch('/products/{id}', [ProductController::class, 'update'])->middleware('jwt.auth');
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

Route::post('/upload', [UploadController::class, 'upload'])->middleware('jwt.auth');

Route::get('/products/{productId}/variants', [VariantController::class, 'index']);

Route::middleware('jwt.auth')->group(function () {
    Route::post('/products/{productId}/variants', [VariantController::class, 'store']);
    Route::patch('/products/{productId}/variants/{variantId}', [VariantController::class, 'update']);
    Route::delete('/products/{productId}/variants/{variantId}', [VariantController::class, 'destroy']);
});

Route::post('/shops', [ShopController::class, 'store'])->middleware('jwt.auth');
Route::get('/shops/my', [ShopController::class, 'my'])->middleware('jwt.auth');
Route::get('/shops/admin/all', [ShopController::class, 'adminAll'])->middleware('jwt.auth');
Route::patch('/shops/admin/{id}/approve', [ShopController::class, 'approve'])->middleware('jwt.auth');
Route::patch('/shops/admin/{id}/suspend', [ShopController::class, 'suspend'])->middleware('jwt.auth');
Route::get('/shops/{id}', [ShopController::class, 'show']);
Route::get('/shops/{id}/products', [ShopController::class, 'products']);

Route::get('/promotions', [PromotionController::class, 'index']);
Route::post('/promotions', [PromotionController::class, 'store'])->middleware('jwt.auth');
Route::patch('/promotions/{id}', [PromotionController::class, 'update'])->middleware('jwt.auth');
Route::delete('/promotions/{id}', [PromotionController::class, 'destroy'])->middleware('jwt.auth');
Route::post('/promotions/validate', [PromotionController::class, 'validate']);
