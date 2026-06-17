<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
