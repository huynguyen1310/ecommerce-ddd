<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $shops = [
            [
                'id' => 'd1e2f3a4-b5c6-4789-a1b2-c3d4e5f6a7b8',
                'owner_id' => 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
                'name' => 'Shop One',
                'slug' => 'shop-one',
                'description' => 'Premium digital products covering architecture, design patterns, and backend engineering.',
                'status' => 'active',
            ],
            [
                'id' => 'e2f3a4b5-c6d7-4890-b2c3-d4e5f6a7b8c9',
                'owner_id' => 'b2c3d4e5-f6a7-4890-bcde-f12345678901',
                'name' => 'Shop Two',
                'slug' => 'shop-two',
                'description' => 'Frontend and full-stack development resources for modern web engineers.',
                'status' => 'active',
            ],
            [
                'id' => 'f3a4b5c6-d7e8-4901-c3d4-e5f6a7b8c9d0',
                'owner_id' => 'c3d4e5f6-a7b8-4901-cdef-123456789012',
                'name' => 'Shop Three',
                'slug' => 'shop-three',
                'description' => 'DevOps, cloud infrastructure, and platform engineering toolkits.',
                'status' => 'active',
            ],
        ];

        foreach ($shops as $shop) {
            DB::table('shops')->updateOrInsert(
                ['id' => $shop['id']],
                $shop + ['created_at' => now(), 'updated_at' => now()]
            );
        }

        echo "Shops seeded: " . count($shops) . "\n";
    }
}
