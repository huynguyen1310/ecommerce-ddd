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

    private function toDocument(Product $product, ?string $shopName = null): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description ?? '',
            'category' => $product->category ?? '',
            'sku' => $product->sku,
            'price' => (float) $product->price,
            'imageUrl' => $product->imageUrl ?? '',
            'images' => $product->images,
            'shop_id' => $product->shopId ?? '',
            'shop_name' => $shopName ?? '',
            'in_stock' => $product->stock > 0,
            'stock' => $product->stock,
            'created_at' => time(),
        ];
    }

    public function sync(Product $product, ?string $shopName = null): void
    {
        $this->client->index(self::INDEX_NAME)->addDocuments([
            $this->toDocument($product, $shopName),
        ]);
    }

    public function delete(string $id): void
    {
        $this->client->index(self::INDEX_NAME)->deleteDocument($id);
    }

    /** @return array{id: string, name: string, price: float, imageUrl: string, shop_name: string}[] */
    public function suggest(string $query, int $limit = 5): array
    {
        $result = $this->client->index(self::INDEX_NAME)->search($query, [
            'limit' => $limit,
            'attributesToRetrieve' => ['id', 'name', 'price', 'imageUrl', 'shop_name', 'in_stock'],
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

    /** @return array{hits: array, total: int, page: int, perPage: int} */
    public function search(
        string $query,
        array $filters = [],
        string $sort = '',
        int $page = 1,
        int $perPage = 20,
    ): array {
        $params = [
            'page' => $page,
            'hitsPerPage' => $perPage,
            'attributesToRetrieve' => ['id', 'name', 'price', 'imageUrl', 'category', 'in_stock', 'shop_name', 'shop_id'],
            'attributesToHighlight' => ['name', 'description'],
        ];

        $filterParts = [];
        if (!empty($filters['category'])) {
            $filterParts[] = "category = " . $this->escapeFilterValue($filters['category']);
        }
        if (isset($filters['min_price'])) {
            $filterParts[] = "price >= {$filters['min_price']}";
        }
        if (isset($filters['max_price'])) {
            $filterParts[] = "price <= {$filters['max_price']}";
        }
        if (!empty($filters['in_stock'])) {
            $filterParts[] = 'in_stock = true';
        }
        if (!empty($filters['shop_id'])) {
            $filterParts[] = "shop_id = " . $this->escapeFilterValue($filters['shop_id']);
        }

        if ($filterParts) {
            $params['filter'] = implode(' AND ', $filterParts);
        }

        if ($sort) {
            $params['sort'] = [$sort];
        }

        $result = $this->client->index(self::INDEX_NAME)->search($query, $params);

        return [
            'hits' => $result->getHits(),
            'total' => $result->getTotalHits() ?? 0,
            'page' => $result->getPage(),
            'perPage' => $result->getHitsPerPage(),
        ];
    }

    public function seedAll(array $products): void
    {
        $documents = array_map(fn(Product $p) => $this->toDocument($p), $products);

        $this->client->index(self::INDEX_NAME)->addDocuments($documents);
    }

    private function escapeFilterValue(string $value): string
    {
        return '"' . str_replace('"', '\\"', $value) . '"';
    }
}
