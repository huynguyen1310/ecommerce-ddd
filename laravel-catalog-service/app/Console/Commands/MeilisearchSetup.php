<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Meilisearch\Client;

class MeilisearchSetup extends Command
{
    protected $signature = 'meilisearch:setup';
    protected $description = 'Configure Meilisearch index settings';

    public function __construct(
        private Client $meilisearch
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $index = $this->meilisearch->index('products');

        $index->updateSearchableAttributes(['name', 'description', 'sku', 'category']);
        $index->updateFilterableAttributes(['category', 'price', 'in_stock', 'shop_id']);
        $index->updateSortableAttributes(['price', 'name', 'created_at']);

        $this->info('Meilisearch index configured.');
    }
}
