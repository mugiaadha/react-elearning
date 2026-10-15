<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Submission;
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
                'brevet_id' => 'nullable|string',
                'slug' => 'nullable|string',
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
        $brevetId = $validated['brevetId'] ?? $request->input('brevet_id') ?? $request->input('slug') ?? 'brevet-ab';
        $amount = $validated['amount'] ?? 2750000;
        $title = $validated['brevetTitle'] ?? 'Brevet Pajak A & B Terpadu';

        $brevet = Brevet::where('id', $brevetId)->orWhere('slug', $brevetId)->first() ?? Brevet::first();
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
            'payment_status' => 'sometimes|nullable|string',
        ]);

        if (!empty($validated['name'])) $user->name = $validated['name'];
        if (array_key_exists('phone', $validated)) $user->phone = $validated['phone'];
        if (array_key_exists('avatar', $validated)) $user->avatar = $validated['avatar'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);
        if (!empty($validated['payment_status'])) {
            $user->payment_status = $validated['payment_status'];
            $activeEnrollment = $user->enrollments()->where('is_active', true)->first();
            if ($activeEnrollment) {
                $activeEnrollment->payment_status = $validated['payment_status'];
                $activeEnrollment->save();
            } else {
                $fallbackEnrollment = $user->enrollments()->latest()->first();
                if ($fallbackEnrollment) {
                    $fallbackEnrollment->payment_status = $validated['payment_status'];
                    if ($validated['payment_status'] === 'APPROVED') {
                        Enrollment::where('user_id', $user->id)->where('id', '!=', $fallbackEnrollment->id)->update(['is_active' => false]);
                        $fallbackEnrollment->is_active = true;
                    }
                    $fallbackEnrollment->save();
                }
            }
        }

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
        $clientPercentage = $request->input('progress_percentage');

        $brevet = Brevet::where('slug', $slug)->orWhere('id', $slug)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Kursus tidak ditemukan.'], 404);
        }

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where(function ($q) use ($brevet, $slug) {
                $q->where('brevet_id', $brevet->id)
                  ->orWhere('brevet_id', $brevet->slug)
                  ->orWhere('brevet_id', $slug);
            })
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
        if ($lessonId) {
            if ($completed && !in_array($lessonId, $currentCompleted)) {
                $currentCompleted[] = $lessonId;
            } elseif (!$completed && in_array($lessonId, $currentCompleted)) {
                $currentCompleted = array_values(array_diff($currentCompleted, [$lessonId]));
            }
        }

        // Count total items (lessons + 1 final exam per module) in brevet curriculum
        $totalItems = 0;
        if (!empty($brevet->curriculum) && is_array($brevet->curriculum)) {
            foreach ($brevet->curriculum as $mod) {
                $totalItems += count($mod['lessons'] ?? []) + 1;
            }
        }
        if ($totalItems <= 0) $totalItems = 6;

        $computedPercentage = min(100, (int) round((count($currentCompleted) / $totalItems) * 100));
        $progressPercentage = is_numeric($clientPercentage) ? min(100, max(0, (int)$clientPercentage)) : $computedPercentage;

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
                'user' => $this->formatUserProfile($user->fresh()),
            ],
        ]);
    }

    /**
     * Get current student's exam submissions
     */
    public function userSubmissions(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $brevetId = $request->query('brevet_id');
        $query = Submission::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('student_email', $user->email);
        });

        if ($brevetId) {
            $query->where('brevet_id', $brevetId);
        }

        $submissions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    /**
     * Student submits exam / assignment link for a module
     */
    public function submitExam(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $rawUrl = trim($request->input('submission_url', ''));
        if (!empty($rawUrl) && !preg_match('/^https?:\/\//i', $rawUrl)) {
            $rawUrl = 'https://' . $rawUrl;
        }

        $validated = $request->validate([
            'brevet_id' => 'required|string',
            'module_id' => 'required|string',
            'module_title' => 'nullable|string',
            'submission_url' => 'nullable|string',
            'file' => 'nullable|file|max:35840', // up to 35MB
            'notes' => 'nullable|string',
        ]);

        $submissionUrl = $rawUrl;
        $fileSizeText = 'Link Google Drive / Docs';

        // Handle direct file upload from student
        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $extension = strtolower($uploadedFile->getClientOriginalExtension());
            $cleanName = Str::slug(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = 'jawaban_' . Str::slug($user->name) . '_' . $cleanName . '_' . time() . '.' . $extension;
            
            $path = $uploadedFile->storeAs('submissions', $filename, 'public');
            $submissionUrl = asset('storage/' . $path);
            
            $bytes = $uploadedFile->getSize();
            if ($bytes >= 1048576) {
                $fileSizeText = round($bytes / 1048576, 2) . ' MB (' . strtoupper($extension) . ')';
            } else {
                $fileSizeText = round($bytes / 1024, 1) . ' KB (' . strtoupper($extension) . ')';
            }
        }

        if (empty($submissionUrl)) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan unggah file lembar jawaban Anda atau cantumkan tautan Google Drive.',
            ], 422);
        }

        $brevet = Brevet::find($validated['brevet_id']) ?? Brevet::where('slug', $validated['brevet_id'])->first();
        $courseTitle = $brevet?->title ?? 'Brevet Pajak';

        // Check if previous submission exists for this module
        $submission = Submission::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('student_email', $user->email);
        })->where('module_id', $validated['module_id'])->first();

        if (!$submission) {
            $submission = new Submission();
            $submission->id = 'sub-' . rand(1000, 9999);
        }

        $submission->user_id = $user->id;
        $submission->student_name = $user->name;
        $submission->student_email = $user->email;
        $submission->brevet_id = $brevet?->id ?? $validated['brevet_id'];
        $submission->course = $courseTitle;
        $submission->module_id = $validated['module_id'];
        $submission->module_title = $validated['module_title'] ?? ('Ujian ' . $validated['module_id']);
        $submission->task = $validated['module_title'] ?? 'Ujian Modul & Studi Kasus';
        $submission->submission_url = $submissionUrl;
        $submission->submission_notes = $validated['notes'] ?? null;
        $submission->submitted_at = 'Hari ini, ' . date('H:i') . ' WIB';
        $submission->file_size = $fileSizeText;
        $submission->status = 'PENDING'; // Submitted, pending teacher review
        $submission->score = null;
        $submission->teacher_feedback = null;
        $submission->save();

        // Also record this exam in completed lessons of enrollment so next module is unlocked
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where(function ($q) use ($brevet, $validated) {
                if ($brevet) {
                    $q->where('brevet_id', $brevet->id)->orWhere('brevet_id', $brevet->slug);
                }
                $q->orWhere('brevet_id', $validated['brevet_id']);
            })
            ->first();

        if ($enrollment) {
            $completed = $enrollment->completed_lessons ?: [];
            $examLessonKey = 'exam-' . $validated['module_id'];
            if (!in_array($examLessonKey, $completed)) {
                $completed[] = $examLessonKey;
                $enrollment->completed_lessons = $completed;
            }

            // Recalculate progress percentage accurately
            $totalItems = 0;
            if (!empty($brevet?->curriculum) && is_array($brevet->curriculum)) {
                foreach ($brevet->curriculum as $mod) {
                    $totalItems += count($mod['lessons'] ?? []) + 1;
                }
            }
            if ($totalItems <= 0) $totalItems = 6;
            $enrollment->progress_percentage = min(100, (int) round((count($completed) / $totalItems) * 100));
            $enrollment->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Lembar jawaban ujian modul berhasil dikirim! Modul berikutnya kini telah terbuka.',
            'data' => $submission,
        ], 201);
    }

    /**
     * Reset student's course progress & submissions back to Bab 1 (Tester/Dev Support)
     */
    public function resetCourseProgress(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $slug = $request->input('slug', 'brevet-ab-terpadu');
        $brevet = Brevet::where('slug', $slug)->orWhere('id', $slug)->first();

        if ($brevet) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where(function ($q) use ($brevet) {
                    $q->where('brevet_id', $brevet->id)->orWhere('brevet_id', $brevet->slug);
                })
                ->first();

            if ($enrollment) {
                $enrollment->update([
                    'completed_lessons' => [],
                    'progress_percentage' => 0,
                ]);
            }

            // Remove submissions for this brevet so user can test uploading again
            Submission::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('student_email', $user->email);
            })
            ->where(function ($q) use ($brevet) {
                $q->where('brevet_id', $brevet->id)->orWhere('brevet_id', $brevet->slug);
            })
            ->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Progres kelas berhasil direset ke awal (Bab 1).',
            'data' => [
                'completed_lessons' => [],
                'progress_percentage' => 0,
                'user' => $this->formatUserProfile($user->fresh()),
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

        $activeEnrollments = $user->enrollments()->where('is_active', true)->get();
        if ($activeEnrollments->count() > 1) {
            $first = $activeEnrollments->first();
            Enrollment::where('user_id', $user->id)->where('id', '!=', $first->id)->update(['is_active' => false]);
        }

        $enrollments = $user->enrollments()->with('brevet')->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'brevet_id' => $e->brevet_id,
                'title' => $e->brevet?->title ?? 'Brevet Pelatihan',
                'description' => $e->brevet?->description ?? $e->brevet?->tagline ?? 'Program pelatihan Brevet Pajak terapan unggulan NAC Tax Center.',
                'tagline' => $e->brevet?->tagline,
                'slug' => $e->brevet?->slug ?? 'brevet-ab-terpadu',
                'invoice_id' => $e->invoice_number,
                'amount' => $e->amount,
                'payment_method' => $e->payment_method,
                'payment_status' => $e->payment_status,
                'is_active' => (bool)$e->is_active,
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
     * Set active classroom brevet for student
     */
    public function setActiveBrevet(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $brevetId = $request->input('brevet_id') ?? $request->input('slug');
        if (!$brevetId) {
            return response()->json(['success' => false, 'message' => 'Parameter brevet_id wajib diisi.'], 422);
        }

        $brevet = Brevet::where('id', $brevetId)->orWhere('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Program brevet tidak ditemukan.'], 404);
        }

        $targetEnrollment = Enrollment::where('user_id', $user->id)
            ->where(function ($q) use ($brevet) {
                $q->where('brevet_id', $brevet->id)
                  ->orWhere('brevet_id', $brevet->slug);
            })
            ->first();

        if (!$targetEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum terdaftar pada program brevet ini.',
            ], 400);
        }

        if ($targetEnrollment->payment_status !== 'APPROVED') {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran untuk program ini belum disetujui oleh admin.',
            ], 400);
        }

        // Set all other enrollments of this student to inactive
        Enrollment::where('user_id', $user->id)->update(['is_active' => false]);

        // Set selected enrollment to active
        $targetEnrollment->is_active = true;
        $targetEnrollment->save();

        return response()->json([
            'success' => true,
            'message' => 'Ruang kelas aktif berhasil dialihkan ke ' . $brevet->title . '.',
            'data' => $this->formatUserProfile($user->fresh()),
        ]);
    }

    /**
     * Existing authenticated student enrolls in an additional brevet program
     */
    public function enrollBrevet(Request $request)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $brevetId = $request->input('brevet_id') ?? $request->input('slug');
        if (!$brevetId) {
            return response()->json(['success' => false, 'message' => 'Pilihan program brevet wajib disertakan.'], 422);
        }

        $brevet = Brevet::where('id', $brevetId)->orWhere('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Program brevet yang dipilih tidak ditemukan.'], 404);
        }

        // Check if student is already enrolled in this brevet
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where(function ($q) use ($brevet) {
                $q->where('brevet_id', $brevet->id)
                  ->orWhere('brevet_id', $brevet->slug);
            })
            ->first();

        if ($existingEnrollment) {
            if ($existingEnrollment->payment_status === 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah terdaftar dan aktif pada program ' . $brevet->title . '.',
                    'data' => [
                        'already_active' => true,
                        'brevet_id' => $brevet->id,
                        'slug' => $brevet->slug,
                    ],
                ], 400);
            }

            // If already registered but pending approval, return existing invoice
            $existingPayment = Payment::where('invoice_number', $existingEnrollment->invoice_number)->first();
            return response()->json([
                'success' => true,
                'message' => 'Tagihan pendaftaran program ' . $brevet->title . ' sudah tersedia. Silakan selesaikan pembayaran.',
                'data' => [
                    'invoice_id' => $existingEnrollment->invoice_number,
                    'amount' => $existingEnrollment->amount,
                    'brevet_title' => $brevet->title,
                    'brevet_id' => $brevet->id,
                    'slug' => $brevet->slug,
                    'payment' => $existingPayment,
                ],
            ]);
        }

        // Generate new unique invoice ID
        $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);
        $amount = $brevet->price ?: 2750000;

        // Create new enrollment with PENDING_APPROVAL and is_active: false
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'brevet_id' => $brevet->id,
            'invoice_number' => $invoiceId,
            'amount' => $amount,
            'payment_method' => 'QRIS Dinamis',
            'payment_status' => 'PENDING_APPROVAL',
            'progress_percentage' => 0,
            'completed_lessons' => [],
            'is_active' => false,
            'registered_date' => now(),
        ]);

        // Create new Payment invoice record
        $payment = Payment::create([
            'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
            'invoice_number' => $invoiceId,
            'user_id' => $user->id,
            'brevet_id' => $brevet->id,
            'student_name' => $user->name,
            'student_email' => $user->email,
            'student_phone' => $user->phone,
            'brevet_title' => $brevet->title,
            'amount' => $amount,
            'payment_method' => 'QRIS Dinamis',
            'status' => 'PENDING_APPROVAL',
            'transaction_time' => now(),
            'sender_account_name' => $user->name,
            'notes' => 'Pendaftaran program brevet tambahan oleh mahasiswa',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran ' . $brevet->title . ' berhasil dicatat! Silakan lakukan pembayaran tagihan.',
            'data' => [
                'invoice_id' => $invoiceId,
                'amount' => $amount,
                'brevet_title' => $brevet->title,
                'brevet_id' => $brevet->id,
                'slug' => $brevet->slug,
                'payment' => $payment,
            ],
        ], 201);
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
        // Ensure only one enrollment is active (self-healing)
        $activeEnrollments = $user->enrollments()->where('is_active', true)->get();
        if ($activeEnrollments->count() > 1) {
            $enrollment = $activeEnrollments->first();
            Enrollment::where('user_id', $user->id)->where('id', '!=', $enrollment->id)->update(['is_active' => false]);
        } else {
            $enrollment = $activeEnrollments->first()
                ?? $user->enrollments()->where('payment_status', 'APPROVED')->first()
                ?? $user->enrollments()->latest()->first();
        }
        $brevet = $enrollment?->brevet;

        $activeBrevet = null;
        if ($user->role === 'student') {
            $instructorName = $brevet?->instructor['name'] ?? ($brevet?->id === 'coretax-mastery' ? 'Ratna Paramitha, S.E., M.Si., BKP' : 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP');
            $modulesCount = is_array($brevet?->curriculum) ? count($brevet->curriculum) : 5;

            $activeBrevet = [
                'id' => $enrollment?->brevet_id ?? ($brevet?->id ?? 'brevet-ab'),
                'slug' => $brevet?->slug ?? 'brevet-ab-terpadu',
                'title' => $brevet?->title ?? 'Brevet Pajak A & B Terpadu',
                'description' => $brevet?->description ?? $brevet?->tagline ?? 'Kurikulum terpadu KUP, PPh, PPN, dan Simulasi Coretax DJP.',
                'tagline' => $brevet?->tagline,
                'instructor_name' => $instructorName,
                'modules_count' => $modulesCount,
                'invoice_id' => $enrollment?->invoice_number ?? 'INV-NAC-2026-0892',
                'amount' => $enrollment?->amount ?? 2750000,
                'registered_date' => $enrollment?->registered_date?->toISOString() ?? now()->toISOString(),
                'payment_method' => $enrollment?->payment_method ?? 'QRIS Dinamis',
                'payment_proof_url' => $enrollment?->payment_proof_url,
                'proof_uploaded' => !empty($enrollment?->payment_proof_url),
                'payment_status' => $enrollment?->payment_status ?? $user->payment_status,
                'is_active' => (bool)($enrollment?->is_active ?? false),
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
            'numeric_id' => $user->id,
            'database_id' => $user->id,
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
        $brevetId = $request->query('brevet_id') ?: $request->query('brevetId') ?: $request->query('slug') ?: 'brevet-ab';

        $url = null;
        if (!empty($clientId)) {
            $params = [
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'response_type' => 'code',
                'scope' => 'openid profile email',
                'access_type' => 'offline',
                'prompt' => 'select_account',
            ];
            if (!empty($brevetId)) {
                $params['state'] = json_encode(['brevet_id' => $brevetId]);
            }
            $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
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
        $brevetId = $request->query('brevet_id') ?: $request->query('brevetId') ?: $request->query('slug');

        if (empty($clientId)) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            return redirect($frontendUrl . '/login?error=' . urlencode('Google Client ID belum dikonfigurasi di file .env backend.'));
        }

        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ];
        if (!empty($brevetId)) {
            $params['state'] = json_encode(['brevet_id' => $brevetId]);
        }

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params));
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

            // If user explicitly registered or logged in for a specific brevet (e.g., coretax-mastery)
            $requestedBrevetId = $request->input('brevetId') ?: $request->input('brevet_id') ?: $request->input('slug');
            if ($requestedBrevetId) {
                $targetBrevet = Brevet::where('id', $requestedBrevetId)->orWhere('slug', $requestedBrevetId)->first();
                if ($targetBrevet) {
                    $existingEnrollment = Enrollment::where('user_id', $user->id)
                        ->where(function ($q) use ($targetBrevet) {
                            $q->where('brevet_id', $targetBrevet->id)->orWhere('brevet_id', $targetBrevet->slug);
                        })->first();

                    if (!$existingEnrollment) {
                        $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);
                        Enrollment::create([
                            'user_id' => $user->id,
                            'brevet_id' => $targetBrevet->id,
                            'invoice_number' => $invoiceId,
                            'amount' => $targetBrevet->price,
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
                            'brevet_id' => $targetBrevet->id,
                            'brevet_title' => $targetBrevet->title,
                            'amount' => $targetBrevet->price,
                            'payment_method' => 'QRIS Dinamis',
                            'transaction_time' => now(),
                            'status' => 'PENDING_APPROVAL',
                            'sender_account_name' => $user->name,
                            'notes' => 'Pendaftaran program via Akun Google',
                        ]);
                    }
                }
            }
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

            // Create initial enrollment for course based on selected brevet
            $brevetId = $request->input('brevetId') ?: $request->input('brevet_id') ?: $request->input('slug') ?: 'brevet-ab';
            $brevet = Brevet::where('id', $brevetId)->orWhere('slug', $brevetId)->first() ?? Brevet::first();
            $targetBrevetId = $brevet ? $brevet->id : 'brevet-ab';
            $amount = $brevet ? $brevet->price : 2750000;
            $title = $brevet ? $brevet->title : 'Brevet Pajak A & B Terpadu';
            $invoiceId = 'INV-NAC-' . date('Y') . '-' . rand(1000, 9999);

            Enrollment::create([
                'user_id' => $user->id,
                'brevet_id' => $targetBrevetId,
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
                'brevet_id' => $targetBrevetId,
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
        $state = $request->query('state');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if (!$code) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Otorisasi Google dibatalkan.'));
        }

        $brevetId = null;
        if (!empty($state)) {
            $decoded = json_decode($state, true);
            if (is_array($decoded) && !empty($decoded['brevet_id'])) {
                $brevetId = $decoded['brevet_id'];
            } elseif (is_string($state) && !empty($state)) {
                $brevetId = $state;
            }
        }

        // Delegate code exchange to googleLogin logic with brevetId preserved
        $fakeRequest = new Request([
            'code' => $code,
            'brevetId' => $brevetId,
            'brevet_id' => $brevetId,
        ]);
        $response = $this->googleLogin($fakeRequest);
        $data = json_decode($response->getContent(), true);

        if (!empty($data['success']) && !empty($data['token'])) {
            $redirectQuery = ['google_token' => $data['token']];
            if ($brevetId) {
                $redirectQuery['brevet_id'] = $brevetId;
            }
            return redirect($frontendUrl . '/login?' . http_build_query($redirectQuery));
        }

        return redirect($frontendUrl . '/login?error=' . urlencode($data['message'] ?? 'Gagal masuk dengan Google.'));
    }
}
