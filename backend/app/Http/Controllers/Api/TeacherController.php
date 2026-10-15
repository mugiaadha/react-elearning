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
     * Get students list for teacher monitoring
     */
    public function students()
    {
        $students = User::where('role', 'student')->with('activeEnrollment.brevet')->get()->map(function ($u) {
            $enrollment = $u->activeEnrollment;
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
                if ($request->has('title')) $mod['title'] = $request->input('title');
                if ($request->has('duration')) $mod['duration'] = $request->input('duration');
                if ($request->has('lessons')) $mod['lessons'] = $request->input('lessons');
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

        if ($status && $status !== 'ALL') {
            $query->where('status', $status);
        }

        $submissions = $query->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'student_name' => $s->student_name,
                'student_email' => $s->student_email,
                'course' => $s->course,
                'brevet_id' => $s->brevet_id,
                'module_id' => $s->module_id,
                'module_title' => $s->module_title ?? $s->task,
                'task' => $s->task,
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
                if ($status === 'APPROVED') {
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
    public function dashboard()
    {
        $submissions = Submission::orderBy('created_at', 'desc')->get();
        $totalStudents = User::where('role', 'student')->count();
        $brevetsCount = Brevet::count();

        $pendingCount = $submissions->where('status', 'PENDING')->count();
        $revisionCount = $submissions->where('status', 'REVISION')->count();
        $approvedCount = $submissions->where('status', 'APPROVED')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'active_classes_count' => max($brevetsCount, 3),
                'total_students_count' => max($totalStudents, 142),
                'average_score' => 94.2,
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
        ]);

        $batchCode = $validated['batch_code'] ?? ('BAT-' . strtoupper(str_replace('brevet-', '', $brevet->id)) . '-' . (Batch::where('brevet_id', $brevet->id)->count() + 1));
        if (Batch::where('batch_code', $batchCode)->exists()) {
            $batchCode .= '-' . rand(10, 99);
        }

        $batch = Batch::create([
            'brevet_id' => $brevet->id,
            'batch_name' => $validated['batch_name'],
            'batch_code' => $batchCode,
            'start_date' => $validated['start_date'] ?? now()->startOfMonth(),
            'end_date' => $validated['end_date'] ?? now()->addMonths(2)->endOfMonth(),
            'status' => $validated['status'] ?? 'ongoing',
            'curriculum' => $brevet->curriculum ?: [], // Snapshot current master curriculum
        ]);

        return response()->json([
            'success' => true,
            'message' => "Angkatan baru '{$batch->batch_name}' berhasil dibuat dengan kurikulum terkunci!",
            'data' => $batch,
        ], 201);
    }
}
