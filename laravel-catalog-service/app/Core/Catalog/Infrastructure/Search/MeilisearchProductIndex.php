<?php

namespace App\Core\Catalog\Infrastructure\Search;

use App\Core\Catalog\Domain\Product;
use Meilisearch\Client;

class MeilisearchProductIndex
{
    private const INDEX_NAME = 'products';

    public function __construct(
        private Client $client
    ) {}

    public function sync(Product $product): void
    {
        $index = $this->client->index(self::INDEX_NAME);
        $index->addDocuments([
            [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description ?? '',
                'category' => $product->category ?? '',
                'sku' => $product->sku,
                'price' => $product->price,
                'imageUrl' => $product->imageUrl ?? '',
                'images' => $product->images,
            ]
        ]);
    }

    public function delete(string $id): void
    {
        $this->client->index(self::INDEX_NAME)->deleteDocument($id);
    }

    /** @return array{id: string, name: string, price: float, imageUrl: string}[] */
    public function suggest(string $query, int $limit = 5): array
    {
        $result = $this->client->index(self::INDEX_NAME)->search($query, [
            'limit' => $limit,
            'attributesToRetrieve' => ['id', 'name', 'price', 'imageUrl'],
        ]);
        return $result->getHits();
    }

    /** @return string[] */
    public function searchIds(string $query, ?string $category = null, int $page = 1, int $perPage = 12): array
    {
        $filters = [];
        if ($category) {
            $filters[] = "category = " . $this->escapeFilterValue($category);
        }

        $result = $this->client->index(self::INDEX_NAME)->search($query, [
            'filter' => $filters ? implode(' AND ', $filters) : null,
            'page' => $page,
            'hitsPerPage' => $perPage,
            'attributesToRetrieve' => ['id'],
        ]);

        return array_column($result->getHits(), 'id');
    }

    public function seedAll(array $products): void
    {
        $documents = array_map(fn(Product $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'description' => $p->description ?? '',
            'category' => $p->category ?? '',
            'sku' => $p->sku,
            'price' => $p->price,
            'imageUrl' => $p->imageUrl ?? '',
            'images' => $p->images,
        ], $products);

        $index = $this->client->index(self::INDEX_NAME);
        $index->addDocuments($documents);
    }

    private function escapeFilterValue(string $value): string
    {
        return '"' . str_replace('"', '\\"', $value) . '"';
    }
}
