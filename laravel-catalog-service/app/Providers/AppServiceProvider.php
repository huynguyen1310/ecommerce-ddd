<?php

namespace App\Providers;

use App\Core\Catalog\Application\CreateProductAction;
use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Infrastructure\Events\LaravelEventDispatcher;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(EventDispatcher::class, LaravelEventDispatcher::class);
    }

    public function boot(): void
    {
        //
    }
}
