<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    /**
     * Resolve authenticated user from Sanctum token or standard request
     */
    private function resolveAuthTeacher(Request $request)
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        if ($user) {
            return $user;
        }

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
     * Get batch IDs assigned to this teacher (either as primary lead teacher or co-teacher/reviewer)
     */
    private function getTeacherBatchIds($teacherId)
    {
        return Batch::where('assigned_teacher_id', $teacherId)
            ->orWhereHas('teachers', function ($q) use ($teacherId) {
                $q->where('users.id', $teacherId);
            })
            ->pluck('id');
    }

    /**
     * Enforce status exclusivity rule for a brevet:
     * Only 1 'open' and 1 'ongoing' batch allowed per brevet.
     * Duplicate active statuses automatically become 'finished'.
     */
    private function enforceBatchStatusExclusivity($brevetId, $targetStatus, $excludeBatchId = null)
    {
        if (in_array($targetStatus, ['open', 'ongoing'])) {
            $query = Batch::where('brevet_id', $brevetId)
                ->where('status', $targetStatus);

            if ($excludeBatchId) {
                $query->where('id', '!=', $excludeBatchId);
            }

            $query->update(['status' => 'finished']);
        }
    }

    /**
     * Get list of all registered teachers for assigning reviewers/co-teachers
     */
    public function teacherList()
    {
        $teachers = User::where('role', 'teacher')
            ->select('id', 'name', 'email', 'avatar', 'phone')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }

    /**
     * Get students list for teacher monitoring
     */
    public function students(Request $request)
    {
        $teacher = $this->resolveAuthTeacher($request);
        $isTeacher = $teacher && $teacher->role === 'teacher';

        $query = User::where('role', 'student');

        // Murid yang tampil hanya yang terdaftar di batch yang diampu oleh guru yang login
        if ($isTeacher) {
            $teacherBatchIds = $this->getTeacherBatchIds($teacher->id);
            // Jika guru baru belum memiliki batch sama sekali, langsung kembalikan kosong
            if ($teacherBatchIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada angkatan atau mahasiswa yang ditugaskan ke akun pengajar Anda.',
                    'data' => [],
                ]);
            }

            $query->whereHas('enrollments', function ($q) use ($teacherBatchIds) {
                $q->whereIn('batch_id', $teacherBatchIds);
            });
        }

        $teacherBatchIds = $isTeacher ? $this->getTeacherBatchIds($teacher->id) : null;

        $students = $query->with(['enrollments.brevet', 'enrollments.batch', 'activeEnrollment.brevet', 'activeEnrollment.batch'])->get()->map(function ($u) use ($isTeacher, $teacherBatchIds) {
            // Ambil enrollment yang sesuai dengan batch guru pengampu
            $enrollment = $isTeacher && $teacherBatchIds
                ? ($u->enrollments->first(fn($e) => $teacherBatchIds->contains($e->batch_id)) ?? $u->activeEnrollment)
                : $u->activeEnrollment;

            $brevetTitle = $enrollment?->brevet?->title ?? 'Brevet AB Terpadu';
            $progress = ($enrollment?->progress_percentage ?? 0) . '%';

            $status = 'Aktif Belajar';
            if (($enrollment?->progress_percentage ?? 0) >= 100) {
                $status = 'Lulus (Sertifikat Terbit)';
            } elseif (($enrollment?->progress_percentage ?? 0) >= 80) {
                $status = 'Menjelang Ujian Akhir';
            }

            $lastActiveDate = $enrollment?->updated_at ?? $u->updated_at ?? now();
            $lastActiveStr = $lastActiveDate->isToday()
                ? 'Hari ini, ' . $lastActiveDate->format('H:i') . ' WIB'
                : ($lastActiveDate->isYesterday()
                    ? 'Kemarin, ' . $lastActiveDate->format('H:i') . ' WIB'
                    : $lastActiveDate->format('d M Y, H:i') . ' WIB');

            return [
                'id' => $u->string_id ?? 'usr-' . $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'enrolled' => $brevetTitle,
                'batch_id' => $enrollment?->batch_id,
                'batch_name' => $enrollment?->batch?->batch_name ?? 'Batch 42 - Reguler',
                'batch_code' => $enrollment?->batch?->batch_code ?? 'BAT-AB-42',
                'progress' => $progress,
                'lastActive' => $lastActiveStr,
                'status' => $status,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Data mahasiswa binaan pengajar berhasil diambil.',
            'data' => $students,
        ]);
    }

    /**
     * Get all Brevets for teacher management
     */
    public function brevets()
    {
        $brevets = Brevet::all();

        return response()->json([
            'success' => true,
            'data' => $brevets,
        ]);
    }

    /**
     * Teacher creates a new Brevet program
     */
    public function storeBrevet(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tagline' => 'nullable|string',
            'description' => 'required|string',
            'level' => 'nullable|string',
            'duration' => 'nullable|string',
            'price' => 'nullable|numeric',
        ]);

        $slug = Str::slug($validated['title']) ?: 'brevet-' . uniqid();
        $id = $slug;

        // Ensure unique id/slug
        if (Brevet::where('id', $id)->exists()) {
            $id = $id . '-' . rand(10, 99);
            $slug = $id;
        }

        $brevet = Brevet::create([
            'id' => $id,
            'slug' => $slug,
            'title' => $validated['title'],
            'badge' => 'Program Baru',
            'tagline' => $validated['tagline'] ?? 'Kurikulum Praktis Perpajakan Indonesia',
            'description' => $validated['description'],
            'level' => $validated['level'] ?? 'Tingkat Menengah',
            'duration' => $validated['duration'] ?? '8 Minggu',
            'total_hours' => 48,
            'price' => $validated['price'] ?? 2500000,
            'original_price' => ($validated['price'] ?? 2500000) * 1.4,
            'discount_percentage' => 30,
            'rating' => 5.0,
            'total_reviews' => 1,
            'total_enrolled' => 1,
            'curriculum' => [],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Program '{$brevet->title}' berhasil dibuat!",
            'data' => $brevet,
        ], 201);
    }

    /**
     * Add a module into a Brevet's curriculum
     */
    public function storeModule(Request $request, $brevetId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'nullable|string',
            'lessons' => 'nullable|array',
            'exam_title' => 'required|string|max:255',
            'exam_description' => 'nullable|string',
            'exam_question_url' => 'nullable|string',
        ]);

        $curriculum = $brevet->curriculum ?: [];
        $moduleId = 'mod-' . (count($curriculum) + 1) . '-' . rand(100, 999);

        // Process lessons with external links (YouTube, Google Drive)
        $lessons = [];
        if (!empty($validated['lessons']) && is_array($validated['lessons'])) {
            foreach ($validated['lessons'] as $idx => $l) {
                $lessons[] = [
                    'id' => 'les-' . $moduleId . '-' . ($idx + 1),
                    'title' => $l['title'] ?? 'Materi Pembelajaran ' . ($idx + 1),
                    'duration' => $l['duration'] ?? '45 Menit',
                    'type' => $l['type'] ?? 'video', // 'video', 'pdf', 'excel', 'word', 'ppt'
                    'url' => $l['url'] ?? '', // Google Drive / YouTube link
                    'video_url' => $l['type'] === 'video' ? ($l['url'] ?? '') : null,
                ];
            }
        }

        // If no lessons provided, provide at least 1 lesson default
        if (empty($lessons)) {
            $lessons[] = [
                'id' => 'les-' . $moduleId . '-1',
                'title' => 'Video Kuliah & Pemaparan Silabus ' . $validated['title'],
                'duration' => '45 Menit',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=V74l_zS1x8E',
                'video_url' => 'https://www.youtube.com/watch?v=V74l_zS1x8E',
            ];
        }

        // Exam definition for this module
        $exam = [
            'id' => 'exam-' . $moduleId,
            'title' => $validated['exam_title'],
            'description' => $validated['exam_description'] ?? 'Kerjakan studi kasus dan unggah link Google Drive lembar jawaban Anda di bawah.',
            'question_url' => $validated['exam_question_url'] ?? null,
            'instructions' => 'Pastikan file Google Drive diatur ke "Anyone with the link can view".',
        ];

        $newModule = [
            'id' => $moduleId,
            'title' => $validated['title'],
            'duration' => $validated['duration'] ?? '8 Jam Pelajaran',
            'lessons' => $lessons,
            'exam' => $exam,
        ];

        $curriculum[] = $newModule;
        $brevet->curriculum = $curriculum;
        $brevet->save();

        return response()->json([
            'success' => true,
            'message' => "Modul '{$validated['title']}' berhasil ditambahkan ke kurikulum {$brevet->title}!",
            'data' => $brevet->fresh(),
        ], 201);
    }

    /**
     * Update an existing module in Brevet curriculum
     */
    public function updateModule(Request $request, $brevetId, $moduleId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $curriculum = $brevet->curriculum ?: [];
        $found = false;

        foreach ($curriculum as $index => &$mod) {
            if (($mod['id'] ?? '') === $moduleId) {
                if ($request->has('title'))
                    $mod['title'] = $request->input('title');
                if ($request->has('duration'))
                    $mod['duration'] = $request->input('duration');
                if ($request->has('lessons'))
                    $mod['lessons'] = $request->input('lessons');
                if ($request->has('exam')) {
                    $mod['exam'] = array_merge($mod['exam'] ?? [], $request->input('exam'));
                }
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $brevet->curriculum = $curriculum;
        $brevet->save();

        return response()->json([
            'success' => true,
            'message' => 'Modul dan bahan ajar berhasil diperbarui.',
            'data' => $brevet->fresh(),
        ]);
    }

    /**
     * Delete a module from Brevet curriculum
     */
    public function deleteModule($brevetId, $moduleId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $curriculum = array_values(array_filter($brevet->curriculum ?: [], function ($m) use ($moduleId) {
            return ($m['id'] ?? '') !== $moduleId;
        }));

        $brevet->curriculum = $curriculum;
        $brevet->save();

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil dihapus dari kurikulum.',
            'data' => $brevet->fresh(),
        ]);
    }

    /**
     * Add a lesson/material to an existing module
     */
    public function storeLesson(Request $request, $brevetId, $moduleId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf,excel,word,ppt',
            'url' => 'required|string',
            'duration' => 'nullable|string',
            'is_optional' => 'nullable|boolean',
            'is_update' => 'nullable|boolean',
        ]);

        $curriculum = $brevet->curriculum ?: [];
        $found = false;

        foreach ($curriculum as &$mod) {
            if (($mod['id'] ?? '') === $moduleId) {
                $lessons = $mod['lessons'] ?? [];
                $newLesson = [
                    'id' => 'les-' . $moduleId . '-' . (count($lessons) + 1) . '-' . rand(10, 99),
                    'title' => $validated['title'],
                    'type' => $validated['type'],
                    'url' => $validated['url'],
                    'video_url' => $validated['type'] === 'video' ? $validated['url'] : null,
                    'duration' => $validated['duration'] ?: '30 Menit',
                    'is_optional' => (bool) ($request->input('is_optional', false) || $request->input('is_update', false)),
                    'is_update' => (bool) $request->input('is_update', false),
                ];
                $lessons[] = $newLesson;
                $mod['lessons'] = $lessons;
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $brevet->curriculum = $curriculum;
        $brevet->save();

        return response()->json([
            'success' => true,
            'message' => "Bahan ajar '{$validated['title']}' berhasil ditambahkan ke modul!",
            'data' => $brevet->fresh(),
        ], 201);
    }

    /**
     * Delete a lesson from a module
     */
    public function deleteLesson($brevetId, $moduleId, $lessonId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $curriculum = $brevet->curriculum ?: [];
        $found = false;

        foreach ($curriculum as &$mod) {
            if (($mod['id'] ?? '') === $moduleId) {
                $mod['lessons'] = array_values(array_filter($mod['lessons'] ?? [], function ($l) use ($lessonId) {
                    return ($l['id'] ?? '') !== $lessonId;
                }));
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['success' => false, 'message' => 'Modul tidak ditemukan.'], 404);
        }

        $brevet->curriculum = $curriculum;
        $brevet->save();

        return response()->json([
            'success' => true,
            'message' => 'Bahan ajar berhasil dihapus dari modul.',
            'data' => $brevet->fresh(),
        ]);
    }

    /**
     * Get materials and curriculum for TeacherCoursesPage
     */
    public function materials()
    {
        $materials = Material::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    /**
     * Store new course material (Standalone link)
     */
    public function storeMaterial(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'target_module' => 'nullable|string',
            'file_type' => 'nullable|string',
            'file_url' => 'nullable|string',
            'brevet_id' => 'nullable|string',
        ]);

        $material = Material::create([
            'brevet_id' => $validated['brevet_id'] ?? 'brevet-ab',
            'title' => $validated['title'],
            'target_module' => $validated['target_module'] ?? 'Modul 1: Ketentuan Umum Perpajakan (KUP)',
            'file_type' => $validated['file_type'] ?? 'PDF',
            'file_url' => $validated['file_url'] ?? 'https://drive.google.com',
            'created_date_text' => 'Diunggah ' . date('d M Y'),
            'status' => 'Tersedia untuk Mahasiswa',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bahan ajar '{$material->title}' berhasil diunggah!",
            'data' => $material,
        ], 201);
    }

    /**
     * Get all student submissions for teacher review
     */
    public function submissions(Request $request)
    {
        $status = $request->query('status');
        $query = Submission::orderBy('created_at', 'desc');

        $user = $this->resolveAuthTeacher($request);
        if ($user && $user->role === 'teacher') {
            $teacherBatchIds = $this->getTeacherBatchIds($user->id);
            if ($teacherBatchIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }
            $query->whereIn('batch_id', $teacherBatchIds);
        }

        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->query('batch_id'));
        }

        if ($status && $status !== 'ALL') {
            $query->where('status', $status);
        }

        $submissions = $query->with(['batch', 'brevet', 'user.activeEnrollment.batch'])->get()->map(function ($s) {
            $batchName = $s->batch?->batch_name ?? $s->user?->activeEnrollment?->batch?->batch_name ?? 'Batch 42 - Reguler';
            $batchCode = $s->batch?->batch_code ?? $s->user?->activeEnrollment?->batch?->batch_code ?? 'BAT-AB-42';

            // Ambil lembar soal studi kasus dari kurikulum batch atau master brevet
            $curriculum = $s->batch?->curriculum ?: ($s->brevet?->curriculum ?: []);
            $examQuestionUrl = null;
            $examQuestionTitle = null;
            $examQuestionDescription = null;

            foreach ($curriculum as $mod) {
                $isTargetMod = ($mod['id'] ?? '') === $s->module_id ||
                    ($mod['exam']['id'] ?? '') === $s->module_id ||
                    ('exam-' . ($mod['id'] ?? '')) === $s->module_id;

                if ($isTargetMod) {
                    $examQuestionUrl = $mod['exam']['question_url'] ?? null;
                    $examQuestionTitle = $mod['exam']['title'] ?? null;
                    $examQuestionDescription = $mod['exam']['description'] ?? null;
                    break;
                }
            }

            return [
                'id' => $s->id,
                'student_name' => $s->student_name,
                'student_email' => $s->student_email,
                'course' => $s->course,
                'brevet_id' => $s->brevet_id,
                'batch_id' => $s->batch_id ?? $s->user?->activeEnrollment?->batch_id,
                'batch_name' => $batchName,
                'batch_code' => $batchCode,
                'module_id' => $s->module_id,
                'module_title' => $s->module_title ?? $s->task,
                'task' => $s->task,
                'question_url' => $examQuestionUrl ?: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'question_title' => $examQuestionTitle ?: ($s->module_title ? 'Lembar Soal: ' . $s->module_title : 'Lembar Soal Studi Kasus'),
                'question_description' => $examQuestionDescription ?: 'Selesaikan studi kasus sesuai petunjuk instruktur pengampu.',
                'submission_url' => $s->submission_url,
                'submission_notes' => $s->submission_notes,
                'submitted_at' => $s->submitted_at,
                'file_size' => $s->file_size ?: 'Google Drive Link',
                'status' => $s->status, // PENDING, APPROVED, REVISION, REJECTED
                'score' => $s->score,
                'teacher_feedback' => $s->teacher_feedback,
                'reviewed_at' => $s->reviewed_at ? $s->reviewed_at->format('d M Y H:i') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    /**
     * Teacher reviews student submission (Lulus / Minta Revisi / Tolak)
     */
    public function reviewSubmission(Request $request, $id)
    {
        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'decision' => 'required|in:APPROVE,REVISION,REJECT',
            'score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $status = match ($validated['decision']) {
            'APPROVE' => 'APPROVED',
            'REVISION' => 'REVISION',
            'REJECT' => 'REJECTED',
        };

        $score = $validated['score'] ?? ($status === 'APPROVED' ? 90 : null);

        $submission->update([
            'status' => $status,
            'score' => $score,
            'teacher_feedback' => $validated['feedback'] ?? null,
            'reviewed_at' => now(),
        ]);

        // Sync student's enrollment status based on teacher review
        if ($submission->user_id) {
            $enrollment = Enrollment::where('user_id', $submission->user_id)
                ->where(function ($q) use ($submission) {
                    $q->where('brevet_id', $submission->brevet_id);
                    if ($submission->brevet) {
                        $q->orWhere('brevet_id', $submission->brevet->id)
                            ->orWhere('brevet_id', $submission->brevet->slug);
                    }
                })
                ->first();

            if ($enrollment) {
                // Determine if this submission is for the final module
                $brevet = $submission->brevet ?? Brevet::find($submission->brevet_id);
                $curriculum = $enrollment->batch?->curriculum ?: ($brevet?->curriculum ?: []);
                $lastModule = !empty($curriculum) ? end($curriculum) : null;
                $isLastModuleExam = $lastModule && (
                    $submission->module_id === ($lastModule['id'] ?? '') ||
                    $submission->module_id === ($lastModule['exam']['id'] ?? '') ||
                    $submission->module_id === ('exam-' . ($lastModule['id'] ?? ''))
                );

                if ($status === 'APPROVED' && $isLastModuleExam) {
                    $enrollment->update([
                        'status' => 'PASSED',
                        'passed_at' => now(),
                        'progress_percentage' => 100,
                    ]);
                } elseif (in_array($status, ['REVISION', 'REJECTED'])) {
                    $enrollment->update([
                        'status' => 'ACTIVE',
                        'passed_at' => null,
                    ]);
                }
            }
        }

        $statusLabel = match ($status) {
            'APPROVED' => 'LULUS (Nilai: ' . $score . '/100)',
            'REVISION' => 'PERLU REVISI',
            'REJECTED' => 'DITOLAK',
        };

        return response()->json([
            'success' => true,
            'message' => "Hasil evaluasi untuk {$submission->student_name} berhasil disimpan: {$statusLabel}.",
            'data' => $submission->fresh(),
        ]);
    }

    /**
     * Legacy / Quick grade endpoint
     */
    public function gradeSubmission(Request $request, $id)
    {
        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan.'], 404);
        }

        $score = $request->input('score', 95);
        $submission->update([
            'status' => 'APPROVED',
            'score' => $score,
            'reviewed_at' => now(),
        ]);

        // Sync student's enrollment status to PASSED
        if ($submission->user_id) {
            $enrollment = Enrollment::where('user_id', $submission->user_id)
                ->where(function ($q) use ($submission) {
                    $q->where('brevet_id', $submission->brevet_id);
                    if ($submission->brevet) {
                        $q->orWhere('brevet_id', $submission->brevet->id)
                            ->orWhere('brevet_id', $submission->brevet->slug);
                    }
                })
                ->first();

            if ($enrollment) {
                $enrollment->update([
                    'status' => 'PASSED',
                    'passed_at' => now(),
                    'progress_percentage' => 100,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Tugas dari {$submission->student_name} berhasil dinilai: {$score}/100.",
            'data' => $submission,
        ]);
    }

    /**
     * Get teacher dashboard data (KPI metrics & pending submissions)
     */
    public function dashboard(Request $request)
    {
        $user = $this->resolveAuthTeacher($request);
        $isTeacher = $user && $user->role === 'teacher';

        $teacherBatchIds = $isTeacher
            ? $this->getTeacherBatchIds($user->id)
            : null;

        // Jika guru baru belum punya batch, metrik dashboard langsung 0
        if ($isTeacher && $teacherBatchIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'active_classes_count' => 0,
                    'total_students_count' => 0,
                    'average_score' => 0,
                    'pending_count' => 0,
                    'revision_count' => 0,
                    'approved_count' => 0,
                    'pending_submissions' => [],
                ],
            ]);
        }

        // Total mahasiswa hanya dari angkatan (batch) yang diampu guru ini
        $studentsQuery = User::where('role', 'student');
        if ($isTeacher && $teacherBatchIds) {
            $studentsQuery->whereHas('enrollments', function ($q) use ($teacherBatchIds) {
                $q->whereIn('batch_id', $teacherBatchIds);
            });
        }
        $totalStudents = $studentsQuery->count();

        // Submissions hanya dari angkatan (batch) yang diampu guru ini
        $submissionsQuery = Submission::orderBy('created_at', 'desc');
        if ($isTeacher && $teacherBatchIds) {
            $submissionsQuery->whereIn('batch_id', $teacherBatchIds);
        }
        $submissions = $submissionsQuery->with(['batch', 'user.activeEnrollment.batch'])->get();

        $activeClassesCount = $isTeacher && $teacherBatchIds
            ? Batch::whereIn('id', $teacherBatchIds)->whereIn('status', ['open', 'ongoing'])->count()
            : Brevet::count();

        $pendingCount = $submissions->where('status', 'PENDING')->count();
        $revisionCount = $submissions->where('status', 'REVISION')->count();
        $approvedCount = $submissions->where('status', 'APPROVED')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'active_classes_count' => max($activeClassesCount, 0),
                'total_students_count' => max($totalStudents, 0),
                'average_score' => 0,
                'pending_count' => $pendingCount,
                'revision_count' => $revisionCount,
                'approved_count' => $approvedCount,
                'pending_submissions' => $submissions,
            ],
        ]);
    }

    /**
     * Get batches for a specific brevet
     */
    public function batches($brevetId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $batches = Batch::where('brevet_id', $brevet->id)
            ->with([
                'assignedTeacher:id,name,email,avatar',
                'teachers:id,name,email,avatar'
            ])
            ->withCount('enrollments')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $batches,
        ]);
    }

    /**
     * Teacher creates a new cohort batch with immutable curriculum snapshot
     */
    public function storeBatch(Request $request, $brevetId)
    {
        $brevet = Brevet::find($brevetId) ?? Brevet::where('slug', $brevetId)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'batch_name' => 'required|string|max:255',
            'batch_code' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|in:open,ongoing,finished',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:users,id',
        ]);

        $status = $validated['status'] ?? 'open';

        // 1. Aturan spesial status batch:
        // Dalam 1 brevet, status 'open' (dalam pendaftaran) dan 'ongoing' (berjalan) cuma boleh ada 1.
        // Jika ada status sama yang aktif, otomatis diubah menjadi nonaktif ('finished').
        $this->enforceBatchStatusExclusivity($brevet->id, $status);

        $batchCode = $validated['batch_code'] ?? ('BAT-' . strtoupper(str_replace('brevet-', '', $brevet->id)) . '-' . (Batch::where('brevet_id', $brevet->id)->count() + 1));
        if (Batch::where('batch_code', $batchCode)->exists()) {
            $batchCode .= '-' . rand(10, 99);
        }

        // 2. Otomatis ter-assign dengan guru yang sedang login sebagai primary teacher
        $user = $this->resolveAuthTeacher($request);
        $assignedTeacherId = $user?->id;
        if (!$assignedTeacherId) {
            $assignedTeacherId = User::where('role', 'teacher')->first()?->id;
        }

        $batch = Batch::create([
            'brevet_id' => $brevet->id,
            'assigned_teacher_id' => $assignedTeacherId,
            'batch_name' => $validated['batch_name'],
            'batch_code' => $batchCode,
            'start_date' => $validated['start_date'] ?? now()->startOfMonth(),
            'end_date' => $validated['end_date'] ?? now()->addMonths(2)->endOfMonth(),
            'status' => $status,
            'curriculum' => $brevet->curriculum ?: [], // Snapshot current master curriculum
        ]);

        // 3. Multi-teacher assignment: daftarkan tim guru reviewer ke pivot table batch_teachers
        $teacherIds = collect($validated['teacher_ids'] ?? [])->map(fn($id) => (int)$id)->all();
        if ($assignedTeacherId && !in_array($assignedTeacherId, $teacherIds)) {
            $teacherIds[] = $assignedTeacherId;
        }
        $batch->teachers()->sync($teacherIds);

        $batch->load([
            'assignedTeacher:id,name,email,avatar',
            'teachers:id,name,email,avatar'
        ]);

        return response()->json([
            'success' => true,
            'message' => "Angkatan baru '{$batch->batch_name}' berhasil dibuka!",
            'data' => $batch,
        ], 201);
    }

    /**
     * Teacher / Admin updates a cohort batch
     */
    public function updateBatch(Request $request, $idOrBrevetId, $batchId = null)
    {
        $targetBatchId = $batchId ?: $idOrBrevetId;
        $batch = Batch::find($targetBatchId);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Angkatan / Batch tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'batch_name' => 'sometimes|required|string|max:255',
            'batch_code' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'sometimes|required|in:open,ongoing,finished',
            'assigned_teacher_id' => 'nullable|exists:users,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:users,id',
        ]);

        // Aturan spesial status batch:
        // Jika status diubah menjadi 'open' atau 'ongoing', angkatan lain di program brevet yang sama
        // dengan status tersebut akan otomatis diubah menjadi 'finished' (nonaktif).
        if (isset($validated['status'])) {
            $this->enforceBatchStatusExclusivity($batch->brevet_id, $validated['status'], $batch->id);
            $batch->status = $validated['status'];
        }

        if (isset($validated['batch_name'])) {
            $batch->batch_name = $validated['batch_name'];
        }

        if (array_key_exists('batch_code', $validated) && $validated['batch_code']) {
            $batch->batch_code = $validated['batch_code'];
        }

        if (array_key_exists('start_date', $validated)) {
            $batch->start_date = $validated['start_date'];
        }

        if (array_key_exists('end_date', $validated)) {
            $batch->end_date = $validated['end_date'];
        }

        if (array_key_exists('assigned_teacher_id', $validated) && $validated['assigned_teacher_id']) {
            $batch->assigned_teacher_id = $validated['assigned_teacher_id'];
        }

        $batch->save();

        // Multi-teacher sync: perbarui tim guru pengampu & reviewer
        if (array_key_exists('teacher_ids', $validated)) {
            $teacherIds = collect($validated['teacher_ids'] ?? [])->map(fn($id) => (int)$id)->all();
            if ($batch->assigned_teacher_id && !in_array($batch->assigned_teacher_id, $teacherIds)) {
                $teacherIds[] = $batch->assigned_teacher_id;
            }
            $batch->teachers()->sync($teacherIds);
        }

        $batch->load([
            'assignedTeacher:id,name,email,avatar',
            'teachers:id,name,email,avatar'
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data angkatan '{$batch->batch_name}' berhasil diperbarui!",
            'data' => $batch,
        ]);
    }
}
