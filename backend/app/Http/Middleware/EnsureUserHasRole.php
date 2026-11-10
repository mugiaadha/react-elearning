<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request and verify Sanctum authentication & optional role(s).
     *
     * Usage:
     *   ->middleware('role')                  // Any authenticated user
     *   ->middleware('role:admin')            // Admin only
     *   ->middleware('role:teacher,admin')    // Teacher or Admin
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user('sanctum') ?? $request->user();

        if (!$user) {
            $authHeader = $request->header('Authorization');
            if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
                $tokenModel = PersonalAccessToken::findToken($matches[1]);
                if ($tokenModel && $tokenModel->tokenable) {
                    $user = $tokenModel->tokenable;
                    $request->setUserResolver(fn () => $user);
                }
            }
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.',
            ], 401);
        }

        if (!empty($roles)) {
            $allowedRoles = [];
            foreach ($roles as $r) {
                foreach (explode(',', $r) as $part) {
                    $trimmed = trim($part);
                    if ($trimmed !== '') {
                        $allowedRoles[] = $trimmed;
                    }
                }
            }

            if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hak akses Anda (' . strtoupper((string) $user->role) . ') tidak diizinkan untuk operasi ini.',
                ], 403);
            }
        }

        return $next($request);
    }
}

