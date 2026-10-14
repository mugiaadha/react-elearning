<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Get all pending payments for admin review
     */
    public function pending()
    {
        $payments = Payment::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi pembayaran menunggu verifikasi berhasil diambil.',
            'data' => $payments,
            'meta' => [
                'total_pending' => $payments->where('status', 'PENDING_APPROVAL')->count(),
                'total_amount_pending' => $payments->where('status', 'PENDING_APPROVAL')->sum('amount'),
                'page' => 1,
                'per_page' => 10,
            ],
        ]);
    }

    /**
     * Submit payment proof (Student flow)
     */
    public function uploadProof(Request $request)
    {
        $invoiceId = $request->input('invoiceId', $request->input('invoice_number'));
        $proofUrl = $request->input('proofImageUrl', $request->input('proof_image_url'));
        $notes = $request->input('notes', 'Bukti transfer diunggah via portal');

        // Handle uploaded file if present
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('proofs', 'public');
            $proofUrl = $request->getSchemeAndHttpHost() . '/storage/' . $path;
        }

        if (!$proofUrl) {
            $proofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
        }

        // 1. Update matching Payment record or create new
        $payment = Payment::where('invoice_number', $invoiceId)->first();
        if ($payment) {
            $payment->update([
                'proof_image_url' => $proofUrl,
                'status' => 'PENDING_APPROVAL',
                'notes' => $notes,
            ]);
        } else {
            $user = $request->user() ?: User::where('role', 'student')->first();
            $payment = Payment::create([
                'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
                'invoice_number' => $invoiceId ?: ('INV-NAC-' . date('Y') . '-' . rand(1000, 9999)),
                'user_id' => $user?->id,
                'student_name' => $user?->name ?? 'Mahasiswa',
                'student_email' => $user?->email ?? 'student@example.com',
                'student_phone' => $user?->phone,
                'brevet_id' => 'brevet-ab',
                'brevet_title' => 'Brevet Pajak A & B Terpadu',
                'amount' => 2750000,
                'payment_method' => 'QRIS Dinamis',
                'transaction_time' => now(),
                'proof_image_url' => $proofUrl,
                'status' => 'PENDING_APPROVAL',
                'sender_account_name' => $user?->name,
                'notes' => $notes,
            ]);
        }

        // 2. Update user profile & enrollment
        if ($payment->user_id) {
            $user = User::find($payment->user_id);
            if ($user) {
                $user->update(['payment_status' => 'PENDING_APPROVAL']);
                $enrollment = $user->activeEnrollment;
                if ($enrollment) {
                    $enrollment->update([
                        'payment_status' => 'PENDING_APPROVAL',
                        'payment_proof_url' => $proofUrl,
                        'payment_notes' => $notes,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.',
            'data' => $payment,
        ]);
    }

    /**
     * Admin approves payment
     */
    public function verify($id)
    {
        $payment = Payment::where('id', $id)
            ->orWhere('invoice_number', $id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        $payment->update([
            'status' => 'APPROVED',
            'approved_at' => now(),
        ]);

        // Activate student enrollment
        if ($payment->user_id) {
            $user = User::find($payment->user_id);
            if ($user) {
                $user->update(['payment_status' => 'APPROVED']);
                $enrollment = $user->activeEnrollment;
                if ($enrollment) {
                    $enrollment->update([
                        'payment_status' => 'APPROVED',
                        'is_active' => true,
                        'progress_percentage' => max($enrollment->progress_percentage, 15),
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Pembayaran {$id} berhasil diverifikasi & disetujui.",
            'data' => $payment,
        ]);
    }

    /**
     * Admin rejects payment
     */
    public function reject(Request $request, $id)
    {
        $reason = $request->input('reason', 'Bukti transfer tidak valid atau tidak terbaca.');

        $payment = Payment::where('id', $id)
            ->orWhere('invoice_number', $id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        $payment->update([
            'status' => 'REJECTED',
            'rejection_reason' => $reason,
        ]);

        if ($payment->user_id) {
            $user = User::find($payment->user_id);
            if ($user) {
                $user->update(['payment_status' => 'REJECTED']);
                $enrollment = $user->activeEnrollment;
                if ($enrollment) {
                    $enrollment->update([
                        'payment_status' => 'REJECTED',
                        'is_active' => false,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Pembayaran {$id} ditolak.",
            'data' => $payment,
        ]);
    }
}
