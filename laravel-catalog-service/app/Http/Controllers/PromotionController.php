<?php

namespace App\Http\Controllers;

use App\Models\PromotionEloquentModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = PromotionEloquentModel::query();

        if ($shopId = $request->query('shopId')) {
            $q->where('shop_id', $shopId);
        }
        if ($request->boolean('active')) {
            $q->active();
        }

        $promotions = $q->orderBy('created_at', 'desc')->get();

        return response()->json($promotions);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->input('jwt_user');
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'type' => 'required|in:flash_sale,bundle,bogo,tiered,free_shipping',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'conditions' => 'required|array',
            'rewards' => 'required|array',
        ]);

        $promotion = new PromotionEloquentModel();
        $promotion->id = (string) Str::uuid();
        $promotion->shop_id = $request->input('conditions.shop_id') ?? $request->input('shop_id');
        $promotion->type = $validated['type'];
        $promotion->title = $validated['title'];
        $promotion->description = $validated['description'] ?? null;
        $promotion->start_at = $validated['start_at'];
        $promotion->end_at = $validated['end_at'];
        $promotion->conditions = $validated['conditions'];
        $promotion->rewards = $validated['rewards'];
        $promotion->save();

        return response()->json($promotion, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $promotion = PromotionEloquentModel::find($id);
        if (!$promotion) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'type' => 'sometimes|in:flash_sale,bundle,bogo,tiered,free_shipping',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_at' => 'sometimes|date',
            'end_at' => 'sometimes|date|after:start_at',
            'conditions' => 'sometimes|array',
            'rewards' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $promotion->fill($validated);
        $promotion->save();

        return response()->json($promotion);
    }

    public function destroy(string $id): JsonResponse
    {
        $promotion = PromotionEloquentModel::find($id);
        if (!$promotion) {
            return response()->json(['error' => 'Not found'], 404);
        }
        $promotion->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function validate(Request $request): JsonResponse
    {
        $items = $request->input('items', []);
        $shopId = $request->input('shopId');
        $subtotal = $request->input('subtotal', 0);

        if (!$shopId || empty($items)) {
            return response()->json(['promotions' => [], 'totalSavings' => 0]);
        }

        $promotions = PromotionEloquentModel::active()
            ->where('shop_id', $shopId)
            ->get();

        $results = [];
        $totalSavings = 0;

        foreach ($promotions as $promo) {
            $savings = $this->calculateSavings($promo, $items, $subtotal);
            if ($savings > 0) {
                $results[] = [
                    'id' => $promo->id,
                    'type' => $promo->type,
                    'title' => $promo->title,
                    'description' => $promo->description,
                    'rewards' => $promo->rewards,
                    'end_at' => $promo->end_at,
                    'savings' => round($savings, 2),
                ];
                $totalSavings += $savings;
            }
        }

        return response()->json([
            'promotions' => $results,
            'totalSavings' => round($totalSavings, 2),
        ]);
    }

    private function calculateSavings($promo, array $items, float $subtotal): float
    {
        $conds = $promo->conditions;
        $rewards = $promo->rewards;

        // ponytail: only flash_sale and tiered fully calculate; bundle/bogo simplified
        return match ($promo->type) {
            'flash_sale' => $this->calcFlashSale($promo, $items, $conds, $rewards),
            'tiered' => $this->calcTiered($subtotal, $conds, $rewards),
            'bundle' => $this->calcBundle($items, $conds, $rewards),
            'bogo' => $this->calcBogo($items, $conds, $rewards),
            'free_shipping' => 0, // calculated at checkout
            default => 0,
        };
    }

    private function calcFlashSale($promo, array $items, array $conds, array $rewards): float
    {
        $productIds = $conds['product_ids'] ?? [];
        if (empty($productIds)) return 0;

        $savings = 0;
        foreach ($items as $item) {
            if (in_array($item['productId'] ?? $item['product_id'] ?? '', $productIds)) {
                $price = $item['price'] ?? 0;
                $qty = $item['quantity'] ?? 1;
                $percentOff = $rewards['percent_off'] ?? 0;
                $fixedOff = $rewards['fixed_off'] ?? 0;
                if ($percentOff) {
                    $savings += $price * $qty * ($percentOff / 100);
                }
                if ($fixedOff) {
                    $savings += min($fixedOff * $qty, $price * $qty);
                }
            }
        }
        return $savings;
    }

    private function calcTiered(float $subtotal, array $conds, array $rewards): float
    {
        $tiers = $rewards['tiers'] ?? [];
        if (empty($tiers)) return 0;

        $bestPct = 0;
        foreach ($tiers as $tier) {
            if ($subtotal >= ($tier['min'] ?? 0)) {
                $bestPct = max($bestPct, $tier['percent_off'] ?? 0);
            }
        }
        return $subtotal * ($bestPct / 100);
    }

    private function calcBundle(array $items, array $conds, array $rewards): float
    {
        $bundleIds = $conds['product_ids'] ?? [];
        if (empty($bundleIds)) return 0;

        $matched = array_filter($items, fn($i) => in_array($i['productId'] ?? $i['product_id'] ?? '', $bundleIds));
        if (count($matched) < 2) return 0; // need at least 2 bundle items

        $total = array_sum(array_map(fn($i) => ($i['price'] ?? 0) * ($i['quantity'] ?? 1), $matched));
        return $total * (($rewards['percent_off'] ?? 0) / 100);
    }

    private function calcBogo(array $items, array $conds, array $rewards): float
    {
        $productIds = $conds['product_ids'] ?? [];
        if (!empty($productIds)) {
            $items = array_filter($items, fn($i) => in_array($i['productId'] ?? $i['product_id'] ?? '', $productIds));
        }
        if (empty($items)) return 0;
        $prices = array_map(fn($i) => ($i['price'] ?? 0), $items);
        $qtys = array_map(fn($i) => ($i['quantity'] ?? 1), $items);
        $all = [];
        foreach ($prices as $idx => $p) {
            for ($i = 0; $i < ($qtys[$idx] ?? 1); $i++) {
                $all[] = $p;
            }
        }
        sort($all);
        $buy = $rewards['buy'] ?? 2;
        $free = $rewards['free'] ?? 1;
        $freeItems = 0;
        $idx = 0;
        while ($idx < count($all)) {
            $idx += $buy;
            for ($f = 0; $f < $free && $idx < count($all); $f++) {
                $freeItems++;
                $idx++;
            }
        }
        $savings = 0;
        for ($i = 0; $i < $freeItems && $i < count($all); $i++) {
            $savings += $all[$i]; // cheapest items first
        }
        return $savings;
    }
}
