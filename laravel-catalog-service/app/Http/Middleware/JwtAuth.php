<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $token = substr($header, 7);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        $decoded = base64_decode(strtr($parts[1], '-_', '+/'), true);
        if ($decoded === false) {
            return response()->json(['error' => 'Invalid token encoding'], 401);
        }
        $payload = json_decode($decoded, true);
        if (!$payload || !isset($payload['id'])) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        $request->merge(['jwt_user' => $payload]);
        return $next($request);
    }
}
