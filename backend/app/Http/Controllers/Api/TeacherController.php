<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;

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
            $progress = ($enrollment?->progress_percentage ?? 20) . '%';

            $status = 'Aktif Belajar';
            if (($enrollment?->progress_percentage ?? 0) >= 100) {
                $status = 'Lulus (Sertifikat Terbit)';
            } elseif (($enrollment?->progress_percentage ?? 0) >= 80) {
                $status = 'Menjelang Ujian Akhir';
            }

            return [
                'id' => $u->string_id ?? 'usr-' . $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'enrolled' => $brevetTitle,
                'progress' => $progress,
                'lastActive' => 'Hari ini, ' . date('H:i') . ' WIB',
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
     * Store new course material
     */
    public function storeMaterial(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'target_module' => 'nullable|string',
            'file_type' => 'nullable|string',
        ]);

        $material = Material::create([
            'brevet_id' => 'brevet-ab',
            'title' => $validated['title'],
            'target_module' => $validated['target_module'] ?? 'Modul 1: Ketentuan Umum Perpajakan (KUP)',
            'file_type' => $validated['file_type'] ?? 'PDF',
            'created_date_text' => 'Diunggah ' . date('d M Y'),
            'status' => 'Tersedia untuk Mahasiswa',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bahan ajar '{$material->title}' berhasil diunggah ke silabus Brevet AB!",
            'data' => $material,
        ], 201);
    }

    /**
     * Get teacher dashboard data (KPI metrics & pending submissions)
     */
    public function dashboard()
    {
        $submissions = Submission::orderBy('created_at', 'desc')->get();
        $totalStudents = User::where('role', 'student')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'active_classes_count' => 2,
                'total_students_count' => max($totalStudents, 142),
                'average_score' => 94.2,
                'pending_submissions' => $submissions,
            ],
        ]);
    }

    /**
     * Grade a student submission
     */
    public function gradeSubmission(Request $request, $id)
    {
        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan.'], 404);
        }

        $score = $request->input('score', 95);
        $submission->update([
            'status' => 'GRADED',
            'score' => $score,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Tugas dari {$submission->student_name} berhasil dinilai: {$score}/100.",
            'data' => $submission,
        ]);
    }
}
