<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private array $categories = [
        'Books', 'Courses', 'Video Tutorials', 'E-Books', 'Workshops',
        'Certifications', 'Tools', 'Templates', 'Consulting', 'Audios',
    ];

    private array $topics = [
        'Domain-Driven Design', 'Hexagonal Architecture', 'Event Sourcing', 'CQRS',
        'Microservices', 'API Design', 'Clean Architecture', 'SOLID Principles',
        'Design Patterns', 'Refactoring', 'Test-Driven Development', 'BDD',
        'DevOps', 'CI/CD', 'Cloud Architecture', 'Serverless',
        'Kubernetes', 'Docker', 'Terraform', 'Ansible',
        'React', 'Vue.js', 'Angular', 'Svelte',
        'TypeScript', 'JavaScript', 'Node.js', 'Deno',
        'PHP', 'Laravel', 'Symfony', 'Python',
        'Rust', 'Go', 'Java', 'Kotlin',
        'SQL', 'NoSQL', 'Redis', 'Elasticsearch',
        'System Design', 'Algorithms', 'Data Structures', 'Performance',
        'Security', 'Authentication', 'Authorization', 'OAuth',
        'GraphQL', 'REST', 'gRPC', 'WebSockets',
        'Testing', 'Cypress', 'Playwright', 'Pest',
        'Observability', 'OpenTelemetry', 'Prometheus', 'Grafana',
    ];

    private array $shopIds = [
        'd1e2f3a4-b5c6-4789-a1b2-c3d4e5f6a7b8',
        'e2f3a4b5-c6d7-4890-b2c3-d4e5f6a7b8c9',
        'f3a4b5c6-d7e8-4901-c3d4-e5f6a7b8c9d0',
    ];

    public function run(): void
    {
        if (DB::table('products')->count() > 0) {
            $this->seedImages();
            return;
        }

        $products = [];
        $usedSkus = [];

        for ($i = 1; $i <= 120; $i++) {
            $category = $this->categories[array_rand($this->categories)];
            $topic1 = $this->topics[array_rand($this->topics)];
            $topic2 = $this->topics[array_rand($this->topics)];

            $name = $topic1 . ($i % 3 === 0 ? ' Masterclass' : ($i % 3 === 1 ? ' Fundamentals' : ' in Practice'));

            $baseSku = strtoupper(Str::slug(substr($topic1, 0, 4) . '-' . substr($topic2, 0, 4)));
            $sku = $baseSku;
            $counter = 1;
            while (in_array($sku, $usedSkus)) {
                $sku = $baseSku . '-' . $counter;
                $counter++;
            }
            $usedSkus[] = $sku;

            $shopIndex = min(intdiv($i - 1, 40), 2);
            $color = $this->randomColor();
            $mainUrl = 'https://placehold.co/600x400/' . $color . '/ffffff?text=' . urlencode(substr($topic1, 0, 12)) . '&font=raleway';
            $products[] = [
                'id' => '550e8400-e29b-41d4-a716-' . str_pad((string) $i, 12, '0', STR_PAD_LEFT),
                'name' => $name,
                'sku' => $sku,
                'price' => round(mt_rand(1900, 19900) / 100, 2),
                'stock' => mt_rand(0, 250),
                'image_url' => $mainUrl,
                'images' => json_encode($this->generateImages($topic1, $topic2, $color)),
                'description' => "Comprehensive guide to $topic1 and $topic2. " . $this->randomDescription($topic1, $topic2),
                'category' => $category,
                'shop_id' => $this->shopIds[$shopIndex],
            ];
        }

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['id' => $product['id']],
                [
                    'name' => $product['name'],
                    'sku' => $product['sku'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'image_url' => $product['image_url'],
                    'images' => $product['images'],
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'shop_id' => $product['shop_id'],
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function generateImages(string $topic1, string $topic2, string $color): array
    {
        $imgs = [];
        $angles = ['', '?angle=15', '?angle=30', '?angle=45', '?angle=60'];
        $labels = [$topic1, $topic2, $topic1 . ' ' . $topic2, 'Preview', 'Detail'];
        $taken = 2 + mt_rand(0, 2);
        for ($j = 0; $j < min($taken, count($labels)); $j++) {
            $imgs[] = 'https://placehold.co/600x400/' . $color . '/ffffff?text=' . urlencode(substr($labels[$j], 0, 16)) . $angles[$j];
        }
        return $imgs;
    }

    private function seedImages(): void
    {
        $products = DB::table('products')->whereNull('images')->orWhere('images', '[]')->get();
        foreach ($products as $p) {
            $topic1 = explode(' ', $p->name)[0] ?? 'Product';
            $topic2 = explode(' ', $p->name)[2] ?? 'Preview';
            $color = $this->randomColor();
            DB::table('products')->where('id', $p->id)->update([
                'images' => json_encode($this->generateImages($topic1, $topic2, $color)),
                'updated_at' => now(),
            ]);
        }
    }

    private function randomColor(): string
    {
        $colors = [
            '6366f1', '4f46e5', '7c3aed', '2563eb', '0ea5e9',
            '059669', '0891b2', 'd97706', 'dc2626', 'db2777',
            '9333ea', '0d9488', '15803d', '1d4ed8', 'b45309',
            'be123c', '6d28d9', '0369a1', '65a30d', 'a21caf',
        ];
        return $colors[array_rand($colors)];
    }

    private function randomDescription(string $topic1, string $topic2): string
    {
        $parts = [
            "Learn practical $topic1 with real-world examples.",
            "Master $topic1 and $topic2 through hands-on projects.",
            "From fundamentals to advanced $topic1 techniques.",
            "Build production-ready systems with $topic1.",
            "Deep dive into $topic1 architecture and patterns.",
            "Enterprise-grade $topic1 strategies for modern teams.",
            "Step-by-step $topic1 implementation guide.",
            "Advanced $topic2 patterns combined with $topic1 best practices.",
        ];
        return $parts[array_rand($parts)];
    }
}
