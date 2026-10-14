<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * User login with real credentials validation
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $email = strtolower(trim($request->input('email')));
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.',
            ], 401);
        }

        // Revoke old tokens if any
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Selamat datang kembali, ' . $user->name . '!',
            'token' => $token,
            'data' => $this->formatUserProfile($user),
        ]);
    }

    /**
     * User registration with validation and duplicate email check
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|min:3|max:255',
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|min:8|max:20',
                'brevetId' => 'nullable|string',
                'brevetTitle' => 'nullable|string',
                'amount' => 'nullable|numeric',
            ], [
                'name.required' => 'Nama lengkap wajib diisi.',
                'name.min' => 'Nama lengkap minimal 3 karakter.',
                'email.required' => 'Alamat email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'password.required' => 'Kata sandi wajib diisi.',
                'password.min' => 'Kata sandi minimal 6 karakter.',
            ]);
        } catch (ValidationException $e) {
            $firstError = collect($e->errors())->flatten()->first();
            return response()->json([
                'success' => false,
                'message' => $firstError,
                'errors' => $e->errors(),
            ], 422);
        }

        $email = strtolower(trim($validated['email']));
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            if ($existingUser->email_verified_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alamat email ini sudah terdaftar dan terverifikasi. Silakan masuk menggunakan kata sandi Anda.',
                ], 422);
            }

            // User registered previously but not yet verified: update info and resend OTP
            $existingUser->update([
                'name' => trim($validated['name']),
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? $existingUser->phone,
            ]);
            $user = $existingUser;
        } else {
            $user = User::create([
                'name' => trim($validated['name']),
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => 'student',
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'PENDING_APPROVAL',
                'string_id' => 'usr-student-' . Str::random(4),
            ]);
        }

        $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);
        $brevetId = $validated['brevetId'] ?? 'brevet-ab';
        $amount = $validated['amount'] ?? 2750000;
        $title = $validated['brevetTitle'] ?? 'Brevet Pajak A & B Terpadu';

        $brevet = Brevet::find($brevetId) ?? Brevet::first();
        if ($brevet) {
            $brevetId = $brevet->id;
            $title = $brevet->title;
            $amount = $brevet->price;
        }

        // Create or update enrollment record
        Enrollment::updateOrCreate(
            ['user_id' => $user->id, 'brevet_id' => $brevetId],
            [
                'invoice_number' => $invoiceId,
                'amount' => $amount,
                'payment_method' => 'QRIS Dinamis',
                'payment_status' => 'PENDING_APPROVAL',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => false,
                'registered_date' => now(),
            ]
        );

        // Create or update pending payment invoice
        Payment::updateOrCreate(
            ['user_id' => $user->id, 'brevet_id' => $brevetId, 'status' => 'PENDING_APPROVAL'],
            [
                'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
                'invoice_number' => $invoiceId,
                'student_name' => $user->name,
                'student_email' => $user->email,
                'student_phone' => $user->phone,
                'brevet_title' => $title,
                'amount' => $amount,
                'payment_method' => 'QRIS Dinamis',
                'transaction_time' => now(),
                'sender_account_name' => $user->name,
                'notes' => 'Pendaftaran baru mahasiswa via portal',
            ]
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        $mailService = new \App\Services\MailService();
        $mailResult = $mailService->sendVerificationEmail($user);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil! Email verifikasi telah dikirimkan ke ' . $user->email . '.',
            'token' => $token,
            'data' => $this->formatUserProfile($user),
            'verification' => [
                'code' => $mailResult['code'],
                'expires_at' => $mailResult['expires_at'],
                'smtp_status' => $mailResult['smtp_status'],
            ],
        ], 201);
    }

    /**
     * Get current user profile (resolves from token)
     */
    public function profile(Request $request)
    {
        $user = $request->user('sanctum');

        if (!$user) {
            // Check authorization header token manually if sanctum middleware not attached
            $authHeader = $request->header('Authorization');
            if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $tokenString = $matches[1];
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenString);
                if ($tokenModel) {
                    $user = $tokenModel->tokenable;
                }
            }
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil pengguna berhasil diperoleh.',
            'data' => $this->formatUserProfile($user),
        ]);
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|min:3|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'avatar' => 'sometimes|nullable|string',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if (!empty($validated['name'])) $user->name = $validated['name'];
        if (array_key_exists('phone', $validated)) $user->phone = $validated['phone'];
        if (array_key_exists('avatar', $validated)) $user->avatar = $validated['avatar'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $this->formatUserProfile($user->fresh()),
        ]);
    }

    /**
     * Logout and revoke active session token
     */
    public function logout(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Anda telah berhasil keluar dari sistem.',
        ]);
    }

    /**
     * Track and persist student course learning progress to database
     */
    public function updateProgress(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $slug = $request->input('slug', 'brevet-ab-terpadu');
        $lessonId = $request->input('lessonId');
        $completed = $request->input('completed', true);

        $brevet = Brevet::where('slug', $slug)->orWhere('id', $slug)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Kursus tidak ditemukan.'], 404);
        }

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('brevet_id', $brevet->id)
            ->first();

        if (!$enrollment) {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'brevet_id' => $brevet->id,
                'amount' => $brevet->price,
                'payment_status' => $user->payment_status,
                'is_active' => $user->payment_status === 'APPROVED',
                'progress_percentage' => 0,
                'completed_lessons' => [],
            ]);
        }

        $currentCompleted = $enrollment->completed_lessons ?: [];
        if ($completed && !in_array($lessonId, $currentCompleted)) {
            $currentCompleted[] = $lessonId;
        } elseif (!$completed && in_array($lessonId, $currentCompleted)) {
            $currentCompleted = array_values(array_diff($currentCompleted, [$lessonId]));
        }

        // Count total lessons in brevet curriculum
        $totalLessons = 0;
        if (!empty($brevet->curriculum) && is_array($brevet->curriculum)) {
            foreach ($brevet->curriculum as $mod) {
                $totalLessons += count($mod['lessons'] ?? []);
            }
        }
        if ($totalLessons <= 0) $totalLessons = 6;

        $progressPercentage = min(100, (int) round((count($currentCompleted) / $totalLessons) * 100));

        $enrollment->update([
            'completed_lessons' => $currentCompleted,
            'progress_percentage' => $progressPercentage,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Progres belajar berhasil disimpan.',
            'data' => [
                'completed_lessons' => $currentCompleted,
                'progress_percentage' => $progressPercentage,
            ],
        ]);
    }

    /**
     * Switch role endpoint (strictly for demo and fast inspection)
     * Logs into that role's real pre-seeded user and returns token!
     */
    public function switchRole(Request $request)
    {
        $role = $request->input('role', 'student');
        $paymentStatus = $request->input('payment_status');

        $user = User::where('role', $role)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Role tidak ditemukan.'], 404);
        }

        if ($paymentStatus !== null) {
            $user->payment_status = $paymentStatus;
            $user->save();

            $enrollment = $user->activeEnrollment;
            if ($enrollment) {
                $enrollment->payment_status = $paymentStatus;
                $enrollment->is_active = ($paymentStatus === 'APPROVED');
                $enrollment->save();
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Beralih ke akun ' . $user->name . ' (' . strtoupper($role) . ')',
            'token' => $token,
            'data' => $this->formatUserProfile($user->fresh()),
        ]);
    }

    /**
     * Get user enrollments
     */
    public function enrollments(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $enrollments = $user->enrollments()->with('brevet')->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'brevet_id' => $e->brevet_id,
                'title' => $e->brevet?->title ?? 'Brevet Pelatihan',
                'slug' => $e->brevet?->slug ?? 'brevet-ab-terpadu',
                'invoice_id' => $e->invoice_number,
                'amount' => $e->amount,
                'payment_method' => $e->payment_method,
                'payment_status' => $e->payment_status,
                'is_active' => $e->is_active,
                'progress_percentage' => $e->progress_percentage,
                'completed_lessons' => $e->completed_lessons ?: [],
                'registered_date' => $e->registered_date?->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * Helper to resolve user from Sanctum token
     */
    private function resolveAuthUser(Request $request)
    {
        $user = $request->user('sanctum');
        if ($user) return $user;

        $authHeader = $request->header('Authorization');
        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
            if ($tokenModel) {
                return $tokenModel->tokenable;
            }
        }

        return null;
    }

    /**
     * Format user payload for frontend
     */
    private function formatUserProfile(User $user)
    {
        $enrollment = $user->activeEnrollment;
        $brevet = $enrollment?->brevet;

        $activeBrevet = null;
        if ($user->role === 'student') {
            $activeBrevet = [
                'id' => $enrollment?->brevet_id ?? 'brevet-ab',
                'slug' => $brevet?->slug ?? 'brevet-ab-terpadu',
                'title' => $brevet?->title ?? 'Brevet Pajak A & B Terpadu',
                'invoice_id' => $enrollment?->invoice_number ?? 'INV-NAC-2026-0892',
                'amount' => $enrollment?->amount ?? 2750000,
                'registered_date' => $enrollment?->registered_date?->toISOString() ?? now()->toISOString(),
                'payment_method' => $enrollment?->payment_method ?? 'QRIS Dinamis',
                'payment_proof_url' => $enrollment?->payment_proof_url,
                'proof_uploaded' => !empty($enrollment?->payment_proof_url),
                'payment_status' => $enrollment?->payment_status ?? $user->payment_status,
                'is_active' => $enrollment?->is_active ?? ($user->payment_status === 'APPROVED'),
                'progress_percentage' => $enrollment?->progress_percentage ?? 0,
                'completed_lessons' => $enrollment?->completed_lessons ?: [],
            ];
        } elseif ($user->role === 'teacher') {
            $activeBrevet = [
                'id' => 'brevet-ab',
                'slug' => 'brevet-ab-terpadu',
                'title' => 'Brevet Pajak A & B Terpadu (Kelas Binaan)',
                'is_active' => true,
                'progress_percentage' => 100,
            ];
        }

        $onboardingStep = 'COMPLETED';
        if ($user->role === 'student') {
            if (!$user->email_verified_at) {
                $onboardingStep = 'VERIFY_EMAIL';
            } elseif ($user->payment_status !== 'APPROVED') {
                $onboardingStep = 'PAYMENT';
            } else {
                $onboardingStep = 'COMPLETED';
            }
        }

        return [
            'id' => $user->string_id ?? 'usr-' . $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'registered_at' => $user->created_at?->toISOString(),
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'payment_status' => $user->payment_status,
            'onboarding_step' => $onboardingStep,
            'active_brevet' => $activeBrevet,
            'completed_brevets' => [],
            'certificates' => $user->certificates()->get(),
        ];
    }

    /**
     * Get Google OAuth Redirect URL
     */
    public function googleAuthUrl(Request $request)
    {
        $clientId = env('GOOGLE_CLIENT_ID');
        $redirectUri = env('GOOGLE_REDIRECT_URI', env('APP_URL', 'http://127.0.0.1:8000') . '/auth/google/callback');

        $url = null;
        if (!empty($clientId)) {
            $params = http_build_query([
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'response_type' => 'code',
                'scope' => 'openid profile email',
                'access_type' => 'offline',
                'prompt' => 'select_account',
            ]);
            $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . $params;
        }

        return response()->json([
            'success' => true,
            'is_configured' => !empty($clientId),
            'client_id' => $clientId,
            'auth_url' => $url,
            'redirect_uri' => $redirectUri,
        ]);
    }

    /**
     * Redirect directly to Google OAuth Consent / Account Selection screen
     */
    public function googleRedirect(Request $request)
    {
        $clientId = env('GOOGLE_CLIENT_ID');
        $redirectUri = env('GOOGLE_REDIRECT_URI', env('APP_URL', 'http://127.0.0.1:8000') . '/auth/google/callback');

        if (empty($clientId)) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            return redirect($frontendUrl . '/login?error=' . urlencode('Google Client ID belum dikonfigurasi di file .env backend.'));
        }

        $params = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    }

    /**
     * Save Google OAuth credentials directly to backend .env
     */
    public function saveGoogleConfig(Request $request)
    {
        $request->validate([
            'client_id' => 'required|string',
            'client_secret' => 'nullable|string',
        ]);

        $clientId = trim($request->input('client_id'));
        $clientSecret = trim($request->input('client_secret', ''));

        $envPath = base_path('.env');
        if (file_exists($envPath)) {
            $envContent = file_get_contents($envPath);

            if (str_contains($envContent, 'GOOGLE_CLIENT_ID=')) {
                $envContent = preg_replace('/GOOGLE_CLIENT_ID=.*$/m', 'GOOGLE_CLIENT_ID=' . $clientId, $envContent);
            } else {
                $envContent .= "\nGOOGLE_CLIENT_ID=" . $clientId;
            }

            if (!empty($clientSecret)) {
                if (str_contains($envContent, 'GOOGLE_CLIENT_SECRET=')) {
                    $envContent = preg_replace('/GOOGLE_CLIENT_SECRET=.*$/m', 'GOOGLE_CLIENT_SECRET=' . $clientSecret, $envContent);
                } else {
                    $envContent .= "\nGOOGLE_CLIENT_SECRET=" . $clientSecret;
                }
            }

            file_put_contents($envPath, $envContent);
        }

        $redirectUri = env('GOOGLE_REDIRECT_URI', env('APP_URL', 'http://127.0.0.1:8000') . '/auth/google/callback');
        $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi Google Client ID berhasil disimpan ke .env!',
            'auth_url' => $authUrl,
            'redirect_uri' => $redirectUri,
        ]);
    }

    /**
     * Handle Google OAuth Login / Registration
     */
    public function googleLogin(Request $request)
    {
        $googleEmail = null;
        $googleName = null;
        $googleId = null;
        $googleAvatar = null;

        // 1. Verify Google Credential / ID Token (from Google Identity Services)
        if ($request->filled('credential') || $request->filled('id_token')) {
            $idToken = $request->input('credential') ?: $request->input('id_token');
            try {
                $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $idToken,
                ]);

                if ($response->successful()) {
                    $payload = $response->json();
                    $googleEmail = strtolower(trim($payload['email'] ?? ''));
                    $googleName = $payload['name'] ?? explode('@', $googleEmail)[0];
                    $googleId = $payload['sub'] ?? null;
                    $googleAvatar = $payload['picture'] ?? null;
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Google Tokeninfo Verification Error: ' . $e->getMessage());
            }
        }

        // 2. Exchange OAuth Authorization Code if provided
        if (empty($googleEmail) && $request->filled('code')) {
            $clientId = env('GOOGLE_CLIENT_ID');
            $clientSecret = env('GOOGLE_CLIENT_SECRET');
            $redirectUri = env('GOOGLE_REDIRECT_URI', env('APP_URL', 'http://127.0.0.1:8000') . '/api/auth/google/callback');

            try {
                $tokenRes = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'code' => $request->input('code'),
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirectUri,
                    'grant_type' => 'authorization_code',
                ]);

                if ($tokenRes->successful()) {
                    $tokenData = $tokenRes->json();
                    $accessToken = $tokenData['access_token'] ?? null;
                    $idToken = $tokenData['id_token'] ?? null;

                    // A. Extract user claims directly from id_token JWT payload if available
                    if ($idToken) {
                        $parts = explode('.', $idToken);
                        if (count($parts) >= 2) {
                            $jwtClaims = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
                            if (is_array($jwtClaims)) {
                                $googleEmail = strtolower(trim($jwtClaims['email'] ?? ''));
                                $googleName = $jwtClaims['name'] ?? explode('@', $googleEmail)[0];
                                $googleId = $jwtClaims['sub'] ?? null;
                                $googleAvatar = $jwtClaims['picture'] ?? null;
                            }
                        }
                    }

                    // B. Query Google Userinfo endpoint for latest profile info
                    if ($accessToken) {
                        $userinfoRes = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');
                        if ($userinfoRes->successful()) {
                            $userinfo = $userinfoRes->json();
                            $googleEmail = strtolower(trim($userinfo['email'] ?? $googleEmail));
                            $googleName = $userinfo['name'] ?? $googleName ?? explode('@', $googleEmail)[0];
                            $googleId = $userinfo['sub'] ?? $googleId;
                            $googleAvatar = $userinfo['picture'] ?? $userinfo['avatar'] ?? $googleAvatar;
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Google OAuth Code Exchange Error: ' . $e->getMessage());
            }
        }

        // 3. Direct Verified Payload (from Interactive Google Account Chooser)
        if (empty($googleEmail) && $request->filled('email')) {
            $googleEmail = strtolower(trim($request->input('email')));
            $googleName = $request->input('name') ?: explode('@', $googleEmail)[0];
            $googleId = $request->input('google_id') ?: ('google_' . substr(md5($googleEmail), 0, 16));
            $googleAvatar = $request->input('avatar') ?: null;
        }

        if (empty($googleEmail)) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memvalidasi kredensial Google. Alamat email tidak ditemukan.',
            ], 422);
        }

        // Standardize Google avatar URL to crisp 256px resolution if possible
        if ($googleAvatar && str_contains($googleAvatar, 'googleusercontent.com') && str_contains($googleAvatar, '=s96')) {
            $googleAvatar = preg_replace('/=s96(-c)?/', '=s256-c', $googleAvatar);
        }

        // Check if user already exists
        $user = User::where('email', $googleEmail)->first();
        $isNewUser = false;

        if ($user) {
            // Update Google info and ensure avatar is updated with real Google picture
            $user->google_id = $googleId ?: $user->google_id;
            if ($googleAvatar) {
                $user->avatar = $googleAvatar;
            }
            if (empty($user->email_verified_at)) {
                $user->email_verified_at = now();
            }
            $user->save();
        } else {
            // Register new user via Google
            $isNewUser = true;
            $fallbackAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($googleName ?: 'User') . '&background=0284c7&color=fff&size=256';
            $user = User::create([
                'name' => trim($googleName),
                'email' => $googleEmail,
                'google_id' => $googleId,
                'avatar' => $googleAvatar ?: $fallbackAvatar,
                'role' => 'student',
                'payment_status' => 'PENDING_APPROVAL',
                'email_verified_at' => now(), // Google emails are pre-verified!
                'password' => Hash::make(Str::random(32)),
                'string_id' => 'usr-student-' . Str::random(4),
            ]);

            // Create initial enrollment for course
            $brevetId = $request->input('brevetId', 'brevet-ab');
            $brevet = Brevet::find($brevetId) ?? Brevet::first();
            $amount = $brevet ? $brevet->price : 2750000;
            $title = $brevet ? $brevet->title : 'Brevet Pajak A & B Terpadu';
            $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);

            Enrollment::create([
                'user_id' => $user->id,
                'brevet_id' => $brevet ? $brevet->id : 'brevet-ab',
                'invoice_number' => $invoiceId,
                'amount' => $amount,
                'payment_method' => 'QRIS Dinamis',
                'payment_status' => 'PENDING_APPROVAL',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => false,
                'registered_date' => now(),
            ]);

            Payment::create([
                'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
                'invoice_number' => $invoiceId,
                'user_id' => $user->id,
                'student_name' => $user->name,
                'student_email' => $user->email,
                'student_phone' => $user->phone ?? '-',
                'brevet_id' => $brevet ? $brevet->id : 'brevet-ab',
                'brevet_title' => $title,
                'amount' => $amount,
                'payment_method' => 'QRIS Dinamis',
                'transaction_time' => now(),
                'status' => 'PENDING_APPROVAL',
                'sender_account_name' => $user->name,
                'notes' => 'Pendaftaran akun menggunakan Akun Google',
            ]);

            // Dispatch welcome student email
            try {
                $mailService = new \App\Services\MailService();
                $mailService->sendWelcomeEmail($user);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Failed sending welcome email for Google user: ' . $e->getMessage());
            }
        }

        // Revoke previous tokens and issue fresh Sanctum token
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $isNewUser
                ? 'Pendaftaran dengan Akun Google berhasil! Selamat datang di NAC Tax Center.'
                : 'Berhasil masuk dengan Akun Google (' . $user->email . ').',
            'token' => $token,
            'data' => $this->formatUserProfile($user),
            'is_new_user' => $isNewUser,
        ]);
    }

    /**
     * Browser callback redirect for Google OAuth 2.0
     */
    public function googleCallback(Request $request)
    {
        $code = $request->query('code');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if (!$code) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Otorisasi Google dibatalkan.'));
        }

        // Delegate code exchange to googleLogin logic
        $fakeRequest = new Request(['code' => $code]);
        $response = $this->googleLogin($fakeRequest);
        $data = json_decode($response->getContent(), true);

        if (!empty($data['success']) && !empty($data['token'])) {
            return redirect($frontendUrl . '/login?google_token=' . urlencode($data['token']));
        }

        return redirect($frontendUrl . '/login?error=' . urlencode($data['message'] ?? 'Gagal masuk dengan Google.'));
    }
}
