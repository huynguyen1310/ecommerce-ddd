<?php

namespace App\Console\Commands;

use App\Core\Catalog\Domain\ProductRepositoryInterface;
use App\Core\Catalog\Infrastructure\Search\MeilisearchProductIndex;
use Illuminate\Console\Command;

class MeilisearchReindex extends Command
{
    protected $signature = 'meilisearch:reindex';
    protected $description = 'Reindex all products in Meilisearch';

    public function handle(ProductRepositoryInterface $repo, MeilisearchProductIndex $search): void
    {
        $result = $repo->findAll(1, 500);
        $search->seedAll($result->items);
        $this->info('Indexed ' . count($result->items) . ' products.');
    }
}
