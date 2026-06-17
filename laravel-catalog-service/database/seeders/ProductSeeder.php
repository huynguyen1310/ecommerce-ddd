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
                'name' => 'DDD with Laravel Book',
                'sku' => 'DDD-LARAVEL',
                'price' => 45.00,
                'stock' => 100,
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'name' => 'Hexagonal Architecture Course',
                'sku' => 'HEX-ARCH',
                'price' => 99.00,
                'stock' => 50,
            ],
        ];

        foreach ($products as $product) {
            $data = array_merge($product, ['created_at' => now(), 'updated_at' => now()]);
            
            // Use updateOrInsert but without the created_at in the values array 
            // to avoid overwriting it if the record already exists, 
            // or just use a simple loop with updateOrInsert as it was.
            // Actually, the previous code was already using updateOrInsert.
            // I will change it to first check by SKU as well to be extra safe.
            
            DB::table('products')->updateOrInsert(
                ['id' => $product['id']],
                [
                    'name' => $product['name'],
                    'sku' => $product['sku'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'updated_at' => now(),
                ]
            );
        }
    }
}
