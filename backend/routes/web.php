<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Redirect backend verify-email clicks directly to React frontend app
Route::get('/verify-email', function (\Illuminate\Http\Request $request) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    $query = $request->getQueryString();
    return redirect($frontendUrl . '/verify-email' . ($query ? '?' . $query : ''));
});

// Redirect frontend routes clicked on backend port 8000 directly to React app (port 5173)
Route::get('/login', function () {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    return redirect($frontendUrl . '/login');
});

Route::get('/register', function () {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    return redirect($frontendUrl . '/register');
});

// Google OAuth Web Callbacks & Redirects
Route::get('/auth/google/redirect', [App\Http\Controllers\Api\AuthController::class, 'googleRedirect']);
Route::get('/api/auth/google/redirect', [App\Http\Controllers\Api\AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [App\Http\Controllers\Api\AuthController::class, 'googleCallback']);
Route::get('/api/auth/google/callback', [App\Http\Controllers\Api\AuthController::class, 'googleCallback']);

Route::get('/dashboard/{path?}', function ($path = null) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    return redirect($frontendUrl . '/dashboard' . ($path ? '/' . $path : ''));
})->where('path', '.*');

Route::get('/verify-certificate/{path?}', function ($path = null) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    return redirect($frontendUrl . '/verify-certificate' . ($path ? '/' . $path : ''));
})->where('path', '.*');

Route::get('/onboarding/{path?}', function ($path = null) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    return redirect($frontendUrl . '/onboarding' . ($path ? '/' . $path : ''));
})->where('path', '.*');

// Explicit storage file server to bypass Windows symlink issues in PHP built-in server
Route::get('/storage/proofs/{filename}', function ($filename) {
    $path = storage_path('app/public/proofs/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Cache-Control' => 'public, max-age=86400',
    ]);
});

Route::get('/storage/{folder}/{filename}', function ($folder, $filename) {
    $path = storage_path('app/public/' . $folder . '/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Cache-Control' => 'public, max-age=86400',
    ]);
});
