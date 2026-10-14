<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\User;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    /**
     * List all issued certificates
     */
    public function index(Request $request)
    {
        $query = Certificate::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        $certs = $query->orderBy('issue_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar sertifikat kelulusan NAC Tax Center.',
            'data' => $certs,
        ]);
    }

    /**
     * Verify certificate by ID (Public QR check)
     */
    public function show($certId)
    {
        $cleanId = strtoupper(trim($certId));
        $cert = Certificate::whereRaw('UPPER(certificate_id) = ?', [$cleanId])->first();

        if (!$cert) {
            return response()->json([
                'isValid' => false,
                'certificate' => null,
                'message' => "Sertifikat dengan ID '{$certId}' tidak terdaftar di sistem NAC Tax Center.",
            ], 404);
        }

        return response()->json([
            'isValid' => true,
            'certificate' => $cert,
            'message' => 'Sertifikat resmi dan terdaftar sah di pangkalan data NAC Tax Center.',
        ]);
    }

    /**
     * Issue digital certificate for student upon 100% course completion
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'studentName' => 'required|string',
            'courseTitle' => 'required|string',
            'score' => 'nullable|numeric',
        ]);

        $score = $validated['score'] ?? 95.0;
        $uniqueNumber = rand(10000, 99999);
        $certId = 'NAC-CERT-' . date('Y') . '-AB-' . $uniqueNumber;

        $user = $request->user() ?: User::where('name', $validated['studentName'])->first();

        $cert = Certificate::create([
            'certificate_id' => $certId,
            'user_id' => $user?->id,
            'recipient_name' => $validated['studentName'],
            'course_title' => $validated['courseTitle'],
            'issue_date' => now()->toDateString(),
            'expiry_date' => 'Seumur Hidup',
            'grade' => $score >= 90 ? 'Sangat Memuaskan (A)' : 'Memuaskan (B)',
            'score' => $score,
            'director_name' => 'Dr. Hendrawan Kartiko, S.E., S.H., LL.M., BKP C',
            'status' => 'VALID',
            'verification_url' => url("/verify-certificate/{$certId}"),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat kelulusan resmi berhasil diterbitkan.',
            'data' => $cert,
        ], 201);
    }
}
