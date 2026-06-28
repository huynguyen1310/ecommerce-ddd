<?php

namespace App\Http\Controllers;

use App\Models\TranslationEloquentModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function locales(): JsonResponse
    {
        return response()->json([
            ['code' => 'en', 'name' => 'English', 'native' => 'English', 'flag' => '🇺🇸'],
            ['code' => 'vi', 'name' => 'Vietnamese', 'native' => 'Tiếng Việt', 'flag' => '🇻🇳'],
        ]);
    }

    public function translations(Request $request): JsonResponse
    {
        $locale = $request->query('locale', 'en');
        $rows = TranslationEloquentModel::where('locale', $locale)->get(['key', 'value']);
        $result = [];
        foreach ($rows as $row) {
            $result[$row->key] = $row->value;
        }
        return response()->json($result);
    }

    public function upsert(Request $request): JsonResponse
    {
        $translations = $request->input('translations', []);
        $locale = $request->input('locale', 'en');
        if (empty($translations)) {
            return response()->json(['error' => 'translations required'], 400);
        }
        foreach ($translations as $key => $value) {
            TranslationEloquentModel::updateOrCreate(
                ['locale' => $locale, 'key' => $key],
                ['value' => $value]
            );
        }
        return response()->json(['message' => 'ok']);
    }
}
