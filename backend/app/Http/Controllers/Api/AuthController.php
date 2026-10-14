<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
                'email' => 'required|string|email|max:255|unique:users,email',
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
                'email.unique' => 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk.',
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

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'student',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
            'payment_status' => 'PENDING_APPROVAL',
            'string_id' => 'usr-student-' . Str::random(4),
        ]);

        $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);
        $brevetId = $validated['brevetId'] ?? 'brevet-ab';
        $amount = $validated['amount'] ?? 2750000;
        $title = $validated['brevetTitle'] ?? 'Brevet Pajak A & B Terpadu';

        // Create enrollment record
        Enrollment::create([
            'user_id' => $user->id,
            'brevet_id' => $brevetId,
            'invoice_number' => $invoiceId,
            'amount' => $amount,
            'payment_method' => 'QRIS Dinamis',
            'payment_status' => 'PENDING_APPROVAL',
            'progress_percentage' => 0,
            'completed_lessons' => [],
            'is_active' => false,
            'registered_date' => now(),
        ]);

        // Create pending payment invoice
        Payment::create([
            'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
            'invoice_number' => $invoiceId,
            'user_id' => $user->id,
            'student_name' => $user->name,
            'student_email' => $user->email,
            'student_phone' => $user->phone,
            'brevet_id' => $brevetId,
            'brevet_title' => $title,
            'amount' => $amount,
            'payment_method' => 'QRIS Dinamis',
            'transaction_time' => now(),
            'status' => 'PENDING_APPROVAL',
            'sender_account_name' => $user->name,
            'notes' => 'Pendaftaran baru mahasiswa via portal',
        ]);

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
            'active_brevet' => $activeBrevet,
            'completed_brevets' => [],
            'certificates' => $user->certificates()->get(),
        ];
    }
}
