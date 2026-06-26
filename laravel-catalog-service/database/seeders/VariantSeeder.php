<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VariantSeeder extends Seeder
{
    private array $colorAttributes = [
        ['color' => 'Red', 'size' => 'Small'],
        ['color' => 'Red', 'size' => 'Medium'],
        ['color' => 'Red', 'size' => 'Large'],
        ['color' => 'Blue', 'size' => 'Small'],
        ['color' => 'Blue', 'size' => 'Medium'],
        ['color' => 'Blue', 'size' => 'Large'],
        ['color' => 'Green', 'size' => 'Small'],
        ['color' => 'Green', 'size' => 'Medium'],
        ['color' => 'Green', 'size' => 'Large'],
    ];

    private array $editionAttributes = [
        ['edition' => 'Standard'],
        ['edition' => 'Premium'],
        ['edition' => 'Deluxe'],
    ];

    private array $licenseAttributes = [
        ['license' => 'Single'],
        ['license' => 'Team (5 seats)'],
        ['license' => 'Enterprise'],
    ];

    public function run(): void
    {
        if (DB::table('product_variants')->count() > 0) {
            $this->seedImages();
            return;
        }

        $products = DB::table('products')->pluck('id', 'id')->toArray();

        foreach ($products as $i => $productId) {
            $numVariants = ($i % 5 === 0) ? 3 : (($i % 3 === 0) ? 2 : 0);
            if ($numVariants === 0) continue;

            $baseSku = Str::upper(Str::random(6));
            $attrs = match ($i % 3) {
                0 => $this->colorAttributes,
                1 => $this->editionAttributes,
                default => $this->licenseAttributes,
            };

            $productPrice = DB::table('products')->where('id', $productId)->value('price');

            for ($j = 0; $j < $numVariants; $j++) {
                $label = $attrs[$j]['color'] ?? $attrs[$j]['edition'] ?? $attrs[$j]['license'] ?? 'variant';
                DB::table('product_variants')->updateOrInsert(
                    ['sku' => $baseSku . '-' . $j],
                    [
                        'id' => (string) Str::uuid(),
                        'product_id' => $productId,
                        'attributes' => json_encode($attrs[$j]),
                        'price' => round($productPrice * (1 + ($j * 0.15)), 2),
                        'stock' => mt_rand(0, 50),
                        'image_url' => 'https://placehold.co/400x400/' . $this->colorForIndex($j) . '/ffffff?text=' . urlencode($label),
                    ]
                );
            }
        }
    }

    private function seedImages(): void
    {
        DB::table('product_variants')->whereNull('image_url')->orWhere('image_url', '')
            ->chunkById(100, function ($variants) {
                foreach ($variants as $v) {
                    $colors = ['6366f1', '7c3aed', '059669', 'd97706', 'dc2626'];
                    DB::table('product_variants')->where('id', $v->id)->update([
                        'image_url' => 'https://placehold.co/400x400/' . $colors[array_rand($colors)] . '/ffffff?text=Variant',
                    ]);
                }
            });
    }

    private function colorForIndex(int $i): string
    {
        $colors = ['6366f1', '7c3aed', '059669', 'd97706', 'dc2626', '0ea5e9'];
        return $colors[$i % count($colors)];
    }
}
