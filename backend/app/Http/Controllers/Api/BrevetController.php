<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Brevet;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class BrevetController extends Controller
{
    /**
     * Get all Brevets list
     */
    public function index()
    {
        $brevets = Brevet::with(['batches' => function ($q) {
            $q->whereIn('status', ['open', 'ongoing'])->orderBy('id', 'desc');
        }])->get()->map(function ($b) {
            $data = $b->toArray();
            $data['active_batch'] = $b->batches->first();
            return $data;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar program pelatihan Brevet Pajak berhasil diambil.',
            'data' => $brevets,
        ]);
    }

    /**
     * Get single Brevet by id or slug with cohort/batch curriculum scoping
     */
    public function show(Request $request, $idOrSlug)
    {
        $brevet = Brevet::where('slug', $idOrSlug)
            ->orWhere('id', $idOrSlug)
            ->with(['batches' => function ($q) {
                $q->orderBy('id', 'desc');
            }])
            ->first();

        if (!$brevet) {
            return response()->json([
                'success' => false,
                'message' => "Program Brevet dengan slug/ID '{$idOrSlug}' tidak ditemukan.",
            ], 404);
        }

        $user = auth('sanctum')->user();
        if (!$user && $request->bearerToken()) {
            // Fallback manual personal access token resolver if auth guard is bypassed
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            $user = $token?->tokenable;
        }

        $brevetData = $brevet->toArray();
        $brevetData['active_batch'] = $brevet->batches->whereIn('status', ['open', 'ongoing'])->first() ?? $brevet->batches->first();

        // If authenticated student, resolve curriculum strictly by their cohort batch enrollment
        if ($user) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where(function ($q) use ($brevet) {
                    $q->where('brevet_id', $brevet->id)
                      ->orWhere('brevet_id', $brevet->slug);
                })
                ->with('batch')
                ->first();

            if ($enrollment) {
                // Self-heal: If student does not have batch_id assigned yet, attach to active batch
                if (!$enrollment->batch_id && $brevetData['active_batch']) {
                    $enrollment->batch_id = $brevetData['active_batch']['id'];
                    $enrollment->save();
                    $enrollment->load('batch');
                }

                $batch = $enrollment->batch;
                $isStudentPassed = ($enrollment->status === 'PASSED') || ($enrollment->progress_percentage >= 100);

                if ($batch) {
                    $cohortCurriculum = !empty($batch->curriculum) && is_array($batch->curriculum)
                        ? $batch->curriculum
                        : ($brevet->curriculum ?: []);

                    // If student already graduated, mark any newer lessons added to master curriculum as optional updates
                    $masterCurriculum = $brevet->curriculum ?: [];
                    $finalCurriculum = $this->mergeOptionalCurriculumUpdates($cohortCurriculum, $masterCurriculum, $isStudentPassed);

                    $brevetData['curriculum'] = $finalCurriculum;
                    $brevetData['batch'] = [
                        'id' => $batch->id,
                        'batch_name' => $batch->batch_name,
                        'batch_code' => $batch->batch_code,
                        'status' => $batch->status,
                        'start_date' => $batch->start_date?->format('d M Y'),
                        'end_date' => $batch->end_date?->format('d M Y'),
                    ];
                    $brevetData['batch_name'] = $batch->batch_name;
                    $brevetData['batch_code'] = $batch->batch_code;
                }

                $brevetData['enrollment'] = [
                    'id' => $enrollment->id,
                    'batch_id' => $enrollment->batch_id,
                    'status' => $enrollment->status,
                    'is_passed' => $isStudentPassed,
                    'passed_at' => $enrollment->passed_at?->toISOString(),
                    'progress_percentage' => $enrollment->progress_percentage,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail program Brevet Pajak berhasil diambil.',
            'data' => $brevetData,
        ]);
    }

    /**
     * Get batches for a brevet
     */
    public function batches($idOrSlug)
    {
        $brevet = Brevet::where('slug', $idOrSlug)->orWhere('id', $idOrSlug)->first();
        if (!$brevet) {
            return response()->json(['success' => false, 'message' => 'Brevet tidak ditemukan.'], 404);
        }

        $batches = Batch::where('brevet_id', $brevet->id)->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $batches,
        ]);
    }

    /**
     * Merge curriculum: if user has passed, flag any new master lessons as optional updates
     */
    private function mergeOptionalCurriculumUpdates(array $cohortCurriculum, array $masterCurriculum, bool $isPassed): array
    {
        if (empty($cohortCurriculum)) {
            return $masterCurriculum;
        }

        // Collect existing lesson IDs in the cohort snapshot
        $existingLessonIds = [];
        foreach ($cohortCurriculum as $mod) {
            foreach ($mod['lessons'] ?? [] as $les) {
                if (!empty($les['id'])) {
                    $existingLessonIds[] = $les['id'];
                }
            }
        }

        // Check if master curriculum has any new lessons not in cohort
        $hasNewLessons = false;
        foreach ($masterCurriculum as $mIdx => $mMod) {
            foreach ($mMod['lessons'] ?? [] as $mLes) {
                if (!empty($mLes['id']) && !in_array($mLes['id'], $existingLessonIds)) {
                    $hasNewLessons = true;
                    break 2;
                }
            }
        }

        if (!$hasNewLessons) {
            return $cohortCurriculum;
        }

        // If there are new lessons, merge them into cohort with is_update = true and is_optional = true
        $merged = $cohortCurriculum;
        foreach ($masterCurriculum as $mIdx => $mMod) {
            // Find corresponding module in cohort
            $targetIndex = null;
            foreach ($merged as $cIdx => $cMod) {
                if (($cMod['id'] ?? '') === ($mMod['id'] ?? '')) {
                    $targetIndex = $cIdx;
                    break;
                }
            }

            if ($targetIndex !== null) {
                $cohortLessons = $merged[$targetIndex]['lessons'] ?? [];
                foreach ($mMod['lessons'] ?? [] as $mLes) {
                    if (!empty($mLes['id']) && !in_array($mLes['id'], $existingLessonIds)) {
                        $newLes = $mLes;
                        $newLes['is_update'] = true;
                        $newLes['is_optional'] = true;
                        $newLes['update_badge'] = 'Update Baru (Opsional)';
                        $cohortLessons[] = $newLes;
                    }
                }
                $merged[$targetIndex]['lessons'] = $cohortLessons;
            }
        }

        return $merged;
    }
}
