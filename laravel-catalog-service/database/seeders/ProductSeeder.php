<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440001',
                'name' => 'Domain-Driven Design with Laravel',
                'sku' => 'DDD-LARAVEL',
                'price' => 45.00,
                'stock' => 100,
                'image_url' => 'https://placehold.co/400x400/6366f1/ffffff?text=DDD+Laravel&font=raleway',
                'description' => 'Master tactical DDD patterns in Laravel. Entities, Value Objects, Domain Events, and rich domain models with real-world e-commerce examples.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'name' => 'Hexagonal Architecture Masterclass',
                'sku' => 'HEX-ARCH',
                'price' => 99.00,
                'stock' => 50,
                'image_url' => 'https://placehold.co/400x400/059669/ffffff?text=Hexagonal+Arch&font=raleway',
                'description' => 'Deep dive into ports-and-adapters architecture. Structure apps for testability, maintainability, and framework independence.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440003',
                'name' => 'Event Sourcing in Practice',
                'sku' => 'EVENT-SRC',
                'price' => 59.00,
                'stock' => 75,
                'image_url' => 'https://placehold.co/400x400/7c3aed/ffffff?text=Event+Sourcing&font=raleway',
                'description' => 'Build event-sourced systems from scratch. Aggregates, event stores, projections, and snapshotting with PHP.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440004',
                'name' => 'CQRS for Modern Applications',
                'sku' => 'CQRS-MODERN',
                'price' => 49.00,
                'stock' => 120,
                'image_url' => 'https://placehold.co/400x400/2563eb/ffffff?text=CQRS+Modern&font=raleway',
                'description' => 'Separate reads from writes. Implement command buses, query handlers, and materialized views for high-performance apps.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440005',
                'name' => 'Advanced PHP Testing Bundle',
                'sku' => 'PHP-TEST',
                'price' => 79.00,
                'stock' => 30,
                'image_url' => 'https://placehold.co/400x400/0891b2/ffffff?text=PHP+Testing&font=raleway',
                'description' => 'Pest + PHPUnit mastery. Test doubles, mutation testing, property-based testing, and testing legacy code.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440006',
                'name' => 'Microservices with Laravel',
                'sku' => 'MS-LARAVEL',
                'price' => 69.00,
                'stock' => 60,
                'image_url' => 'https://placehold.co/400x400/d97706/ffffff?text=Microservices&font=raleway',
                'description' => 'Decompose monoliths into services. Service contracts, inter-service communication, distributed transactions, and observability.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440007',
                'name' => 'SQL Performance Deep Dive',
                'sku' => 'SQL-PERF',
                'price' => 39.00,
                'stock' => 200,
                'image_url' => 'https://placehold.co/400x400/4f46e5/ffffff?text=SQL+Performance&font=raleway',
                'description' => 'Query optimization, index strategies, execution plans, and database design patterns for high-throughput systems.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440008',
                'name' => 'React Frontend Architecture',
                'sku' => 'REACT-ARCH',
                'price' => 55.00,
                'stock' => 85,
                'image_url' => 'https://placehold.co/400x400/0ea5e9/ffffff?text=React+Arch&font=raleway',
                'description' => 'Component design, state management patterns, custom hooks, and performance optimization for large-scale React apps.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440009',
                'name' => 'Docker & Kubernetes for Devs',
                'sku' => 'DOCKER-K8S',
                'price' => 65.00,
                'stock' => 45,
                'image_url' => 'https://placehold.co/400x400/dc2626/ffffff?text=Docker+K8s&font=raleway',
                'description' => 'Containerize apps, orchestrate with Kubernetes, CI/CD pipelines, and production-ready deployment strategies.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440010',
                'name' => 'System Design Interview Prep',
                'sku' => 'SYS-DESIGN',
                'price' => 89.00,
                'stock' => 150,
                'image_url' => 'https://placehold.co/400x400/6366f1/ffffff?text=System+Design&font=raleway',
                'description' => 'Design scalable systems. Load balancing, caching, database sharding, CDNs, and real-world architecture case studies.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440011',
                'name' => 'TypeScript Advanced Patterns',
                'sku' => 'TS-PATTERNS',
                'price' => 44.00,
                'stock' => 90,
                'image_url' => 'https://placehold.co/400x400/7c3aed/ffffff?text=TS+Patterns&font=raleway',
                'description' => 'Advanced generics, conditional types, template literals, and type-safe API patterns for production TypeScript.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440012',
                'name' => 'DevOps Pipeline Engineering',
                'sku' => 'DEVOPS-PIPE',
                'price' => 74.00,
                'stock' => 35,
                'image_url' => 'https://placehold.co/400x400/059669/ffffff?text=DevOps+Pipeline&font=raleway',
                'description' => 'Build robust CI/CD pipelines. GitHub Actions, GitLab CI, artifact management, and infrastructure-as-code with Terraform.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440013',
                'name' => 'Redis & Caching Strategies',
                'sku' => 'REDIS-CACHE',
                'price' => 34.00,
                'stock' => 110,
                'image_url' => 'https://placehold.co/400x400/dc2626/ffffff?text=Redis+Cache&font=raleway',
                'description' => 'Cache invalidation, distributed locking, rate limiting, session storage, and real-time features with Redis.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440014',
                'name' => 'API Design with OpenAPI',
                'sku' => 'API-OPENAPI',
                'price' => 42.00,
                'stock' => 70,
                'image_url' => 'https://placehold.co/400x400/2563eb/ffffff?text=API+OpenAPI&font=raleway',
                'description' => 'Design-first API development. OpenAPI 3.1 spec, contract testing, versioning strategies, and SDK generation.',
                'category' => 'Books',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440015',
                'name' => 'Observability with OpenTelemetry',
                'sku' => 'OBSERVE-OTEL',
                'price' => 58.00,
                'stock' => 40,
                'image_url' => 'https://placehold.co/400x400/0891b2/ffffff?text=OpenTelemetry&font=raleway',
                'description' => 'Distributed tracing, metrics, and logging. Instrument PHP and JS apps, configure collectors, and build Grafana dashboards.',
                'category' => 'Courses',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440016',
                'name' => 'Clean Architecture for PHP',
                'sku' => 'CLEAN-PHP',
                'price' => 48.00,
                'stock' => 95,
                'image_url' => 'https://placehold.co/400x400/4f46e5/ffffff?text=Clean+PHP&font=raleway',
                'description' => 'Apply Clean Architecture principles in PHP projects. Dependency inversion, use-case driven design, and framework decoupling.',
                'category' => 'Books',
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['id' => $product['id']],
                [
                    'name' => $product['name'],
                    'sku' => $product['sku'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'image_url' => $product['image_url'],
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'updated_at' => now(),
                ]
            );
        }
    }
}
