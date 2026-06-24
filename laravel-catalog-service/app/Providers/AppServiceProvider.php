<?php

namespace App\Providers;

use App\Core\Catalog\Domain\ShopRepositoryInterface;
use App\Core\Catalog\Infrastructure\Persistence\EloquentShopRepository;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use Illuminate\Support\ServiceProvider;
use Meilisearch\Client;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {

        $this->app->bind(Client::class, function () {
            $host = env('MEILISEARCH_HOST', 'http://localhost:7700');
            $key = env('MEILISEARCH_KEY', '');
            return new Client($host, $key);
        });

        $this->app->bind(MeilisearchProductIndex::class, function () {
            return new MeilisearchProductIndex($this->app->make(Client::class));
        });

        $this->app->bind(ShopRepositoryInterface::class, EloquentShopRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
