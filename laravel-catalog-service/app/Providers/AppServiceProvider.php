<?php

namespace App\Providers;

use App\Core\Catalog\Application\CreateProductAction;
use App\Core\Catalog\Application\Ports\EventDispatcher;
use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Infrastructure\Events\LaravelEventDispatcher;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use Illuminate\Support\ServiceProvider;
use Meilisearch\Client;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(EventDispatcher::class, LaravelEventDispatcher::class);

        $this->app->bind(Client::class, function () {
            $host = env('MEILISEARCH_HOST', 'http://localhost:7700');
            $key = env('MEILISEARCH_KEY', '');
            return new Client($host, $key);
        });

        $this->app->bind(MeilisearchProductIndex::class, function () {
            return new MeilisearchProductIndex($this->app->make(Client::class));
        });
    }

    public function boot(): void
    {
        //
    }
}
