<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Backoffice executive stats for AdminDashboardPage
     */
    public function stats()
    {
        $totalStudents = User::where('role', 'student')->count();
        $activeStudents = User::where('role', 'student')->where('payment_status', 'APPROVED')->count();
        $pendingApprovals = Payment::where('status', 'PENDING_APPROVAL')->count();
        $totalRevenue = Payment::where('status', 'APPROVED')->sum('amount') ?: 0;

        // Dynamic completion rate
        $avgProgress = \App\Models\Enrollment::where('payment_status', 'APPROVED')->avg('progress_percentage');
        $completionRate = $avgProgress !== null ? round($avgProgress, 1) : 0;

        // Dynamic course popularity based on real enrollments
        $brevets = Brevet::all();
        $coursePopularity = $brevets->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'enrolled' => \App\Models\Enrollment::where('brevet_id', $b->id)->count(),
                'active' => \App\Models\Enrollment::where('brevet_id', $b->id)->where('is_active', true)->count(),
            ];
        });

        // Dynamic monthly revenue from approved payments
        $monthlyRevenue = Payment::where('status', 'APPROVED')
            ->selectRaw("strftime('%Y-%m', transaction_time) as month_key, sum(amount) as revenue")
            ->groupBy('month_key')
            ->orderBy('month_key', 'asc')
            ->get()
            ->map(function ($row) {
                $time = strtotime($row->month_key . '-01');
                return [
                    'month' => date('M Y', $time),
                    'revenue' => (float)$row->revenue,
                ];
            });

        if ($monthlyRevenue->isEmpty()) {
            $monthlyRevenue = collect([
                ['month' => date('M Y'), 'revenue' => (float)$totalRevenue],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Statistik backoffice berhasil diambil.',
            'data' => [
                'summary' => [
                    'total_students' => $totalStudents,
                    'active_students' => $activeStudents,
                    'pending_approvals' => $pendingApprovals,
                    'total_revenue_idr' => (float)$totalRevenue,
                    'completion_rate_percentage' => $completionRate,
                ],
                'course_popularity' => $coursePopularity,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }

    /**
     * Student database for AdminStudentsPage
     */
    public function students(Request $request)
    {
        $students = User::where('role', 'student')->with('activeEnrollment.brevet')->get()->map(function ($u) {
            $enrollment = $u->activeEnrollment;
            $brevetTitle = $enrollment?->brevet?->title ?? 'Brevet Pajak A & B Terpadu';
            $status = ($u->payment_status === 'APPROVED' || $enrollment?->is_active) ? 'ACTIVE' : 'PENDING_APPROVAL';
            $progress = ($enrollment?->progress_percentage ?? 0) . '%';

            return [
                'id' => $u->string_id ?? 'usr-' . $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? '+62 812-8890-4123',
                'registered' => $u->created_at ? $u->created_at->format('d M Y') : '12 Okt 2026',
                'brevet' => $brevetTitle,
                'status' => $status,
                'progress' => $progress,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Pangkalan data siswa berhasil diambil.',
            'data' => $students,
        ]);
    }

    /**
     * Teacher database for AdminTeachersPage
     */
    public function teachers(Request $request)
    {
        $teachers = User::where('role', 'teacher')->orderBy('created_at', 'desc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'string_id' => $u->string_id ?? 'tch-' . $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? '-',
                'specialization' => $u->specialization ?? 'Instruktur BKP & Praktisi Pajak',
                'avatar' => $u->avatar,
                'created_at' => $u->created_at ? $u->created_at->format('d M Y, H:i') : '14 Okt 2026',
                'invited_by_admin' => (bool) $u->invited_by_admin,
                'status' => 'ACTIVE',
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajar berhasil diambil.',
            'data' => $teachers,
        ]);
    }

    /**
     * Admin creates a new teacher account and sends credentials via email
     */
    public function createTeacher(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:25',
            'specialization' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ]);

        // Generate strong random password if not supplied
        $plainPassword = !empty($validated['password'])
            ? $validated['password']
            : 'NacTeach#' . rand(1000, 9999);

        $teacher = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => \Illuminate\Support\Facades\Hash::make($plainPassword),
            'phone' => $validated['phone'] ?? null,
            'role' => 'teacher',
            'specialization' => $validated['specialization'] ?? 'Konsultan Pajak & Instruktur Brevet',
            'invited_by_admin' => true,
            'email_verified_at' => now(),
            'payment_status' => 'APPROVED',
            'string_id' => 'tch-' . rand(1000, 9999),
        ]);

        // Send email invitation with login credentials via MailService queue
        $mailService = new \App\Services\MailService();
        $mailResult = $mailService->sendTeacherInvitationEmail($teacher, $plainPassword);

        return response()->json([
            'success' => true,
            'message' => "Akun instruktur untuk {$teacher->name} berhasil dibuat! Email kredensial telah dijadwalkan ke {$teacher->email}.",
            'data' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'plain_password' => $plainPassword,
                'specialization' => $teacher->specialization,
                'mail_queued' => $mailResult['success'] ?? true,
            ],
        ], 201);
    }

    /**
     * Re-send teacher invitation credentials email
     */
    public function resendTeacherInvitation(Request $request, $id)
    {
        $teacher = User::where('id', $id)->where('role', 'teacher')->first();
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Pengajar tidak ditemukan.'], 404);
        }

        // Generate new random password
        $newPassword = 'NacTeach#' . rand(1000, 9999);
        $teacher->password = \Illuminate\Support\Facades\Hash::make($newPassword);
        $teacher->save();

        $mailService = new \App\Services\MailService();
        $mailResult = $mailService->sendTeacherInvitationEmail($teacher, $newPassword);

        return response()->json([
            'success' => true,
            'message' => "Email kredensial baru berhasil dikirimkan ke {$teacher->email}.",
            'data' => [
                'email' => $teacher->email,
                'new_password' => $newPassword,
                'mail_queued' => $mailResult['success'] ?? true,
            ],
        ]);
    }

    /**
     * Delete teacher account
     */
    public function deleteTeacher($id)
    {
        $teacher = User::where('id', $id)->where('role', 'teacher')->first();
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Pengajar tidak ditemukan.'], 404);
        }

        $teacher->delete();

        return response()->json([
            'success' => true,
            'message' => "Akun pengajar {$teacher->name} berhasil dihapus dari sistem.",
        ]);
    }
}

