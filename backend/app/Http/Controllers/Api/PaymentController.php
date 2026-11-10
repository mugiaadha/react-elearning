<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Resolve authenticated user from Sanctum token or fallback
     */
    protected function resolveUser(Request $request): ?User
    {
        if ($request->user()) {
            return $request->user();
        }

        $bearer = $request->bearerToken();
        if ($bearer) {
            $tokenRecord = \Laravel\Sanctum\PersonalAccessToken::findToken($bearer);
            if ($tokenRecord && $tokenRecord->tokenable) {
                return $tokenRecord->tokenable;
            }
        }

        $userId = $request->input('user_id');
        if ($userId) {
            return User::find($userId);
        }

        return null;
    }

    /**
     * Create or retrieve a Midtrans Snap Token for an invoice
     */
    public function createSnapToken(Request $request)
    {
        $user = $this->resolveUser($request);
        $invoiceId = $request->input('invoiceId', $request->input('invoice_number'));
        $brevetId = $request->input('brevetId', $request->input('brevet_id'));

        // 1. Find existing Payment by invoice number, or locate by user's pending enrollment
        $payment = null;
        if ($invoiceId) {
            $payment = Payment::where('invoice_number', $invoiceId)
                ->orWhere('id', $invoiceId)
                ->first();
        }

        if (!$payment && $user) {
            // Check if user has an active pending enrollment
            $pendingEnrollment = $user->enrollments()
                ->where('payment_status', '!=', 'APPROVED')
                ->latest()
                ->first();

            if ($pendingEnrollment) {
                $payment = Payment::where('invoice_number', $pendingEnrollment->invoice_number)->first();
            }
        }

        // 2. If payment record still doesn't exist, create a new one based on course details
        if (!$payment) {
            $targetBrevetId = $brevetId ?: 'brevet-ab';
            $brevet = Brevet::where('id', $targetBrevetId)->orWhere('slug', $targetBrevetId)->first();
            $amount = $brevet?->price ?: 2750000;
            $brevetTitle = $brevet?->title ?: 'Brevet Pajak A & B Terpadu';

            $newInvoice = $invoiceId ?: ('INV-NAC-' . date('Y') . '-' . rand(1000, 9999));
            $payment = Payment::create([
                'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
                'invoice_number' => $newInvoice,
                'user_id' => $user?->id,
                'student_name' => $user?->name ?? 'Mahasiswa NAC',
                'student_email' => $user?->email ?? 'student@nactaxcenter.id',
                'student_phone' => $user?->phone,
                'brevet_id' => $targetBrevetId,
                'brevet_title' => $brevetTitle,
                'amount' => $amount,
                'payment_method' => 'Midtrans Payment Gateway',
                'transaction_time' => now(),
                'status' => 'PENDING_APPROVAL',
            ]);
        }

        // 3. If already approved, return without creating new snap transaction
        if ($payment->status === 'APPROVED') {
            return response()->json([
                'success' => true,
                'message' => 'Tagihan ini telah lunas disetujui sebelumnya.',
                'data' => [
                    'status' => 'APPROVED',
                    'invoice_number' => $payment->invoice_number,
                    'payment' => $payment,
                ],
            ]);
        }

        // 4. Request Midtrans Snap Transaction
        $snapResult = $this->midtransService->createSnapTransaction($payment, $user);

        if (!$snapResult['success']) {
            return response()->json([
                'success' => false,
                'message' => $snapResult['message'] ?? 'Gagal membuat sesi pembayaran Midtrans.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesi pembayaran Midtrans berhasil dibuat.',
            'data' => [
                'token' => $snapResult['token'],
                'redirect_url' => $snapResult['redirect_url'],
                'invoice_number' => $payment->invoice_number,
                'amount' => $payment->amount,
                'client_key' => $this->midtransService->getClientKey(),
                'payment' => $payment->fresh(),
            ],
        ]);
    }

    /**
     * Webhook Notification Handler (called directly by Midtrans)
     */
    public function handleNotification(Request $request)
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;

        if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
            return response()->json([
                'success' => false,
                'message' => 'Parameter notifikasi Midtrans tidak lengkap.',
            ], 400);
        }

        // Verify SHA512 signature
        $isValidSignature = $this->midtransService->verifySignature(
            $orderId,
            $statusCode,
            $grossAmount,
            $signatureKey
        );

        if (!$isValidSignature) {
            return response()->json([
                'success' => false,
                'message' => 'Signature key tidak valid.',
            ], 403);
        }

        $payment = Payment::where('invoice_number', $orderId)
            ->orWhere('id', $orderId)
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => "Tagihan {$orderId} tidak ditemukan di sistem.",
            ], 404);
        }

        $result = $this->midtransService->processStatusUpdate($payment, $payload);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi pembayaran Midtrans berhasil diproses.',
            'data' => $result,
        ]);
    }

    /**
     * Check latest transaction status directly from Midtrans API
     */
    public function checkStatus(Request $request, $orderId)
    {
        $payment = Payment::where('invoice_number', $orderId)
            ->orWhere('id', $orderId)
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data transaksi pembayaran tidak ditemukan.',
            ], 404);
        }

        // Fetch live status from Midtrans
        $midtransStatus = $this->midtransService->getTransactionStatus($payment->invoice_number);

        if ($midtransStatus) {
            $result = $this->midtransService->processStatusUpdate($payment, $midtransStatus);
            return response()->json([
                'success' => true,
                'message' => 'Status pembayaran berhasil disinkronkan dengan Midtrans.',
                'data' => $result['payment'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mengembalikan status pembayaran dari database.',
            'data' => $payment,
        ]);
    }

    /**
     * Get all payments for admin review & transaction monitoring
     */
    public function pending()
    {
        $payments = Payment::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat transaksi pembayaran Midtrans berhasil diambil.',
            'data' => $payments,
            'meta' => [
                'total_transactions' => $payments->count(),
                'total_pending' => $payments->where('status', 'PENDING_APPROVAL')->count(),
                'total_approved' => $payments->where('status', 'APPROVED')->count(),
                'total_amount_approved' => $payments->where('status', 'APPROVED')->sum('amount'),
            ],
        ]);
    }

    /**
     * Admin manual approve override
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
            'transaction_status' => 'settlement',
            'settlement_time' => $payment->settlement_time ?: now(),
            'approved_at' => now(),
        ]);

        if ($payment->user_id) {
            $user = User::find($payment->user_id);
            if ($user) {
                $user->update(['payment_status' => 'APPROVED']);
                $enrollment = Enrollment::where('invoice_number', $payment->invoice_number)->first()
                    ?? Enrollment::where('user_id', $user->id)->where('brevet_id', $payment->brevet_id)->first()
                    ?? $user->activeEnrollment;

                if ($enrollment) {
                    $hasActive = $user->enrollments()->where('is_active', true)->where('id', '!=', $enrollment->id)->exists();
                    $shouldActivate = !$hasActive;
                    if ($shouldActivate) {
                        Enrollment::where('user_id', $user->id)->where('id', '!=', $enrollment->id)->update(['is_active' => false]);
                    }
                    $enrollment->update([
                        'payment_status' => 'APPROVED',
                        'is_active' => $shouldActivate,
                    ]);
                }
            }
        }

        // Send payment approved email when manually verified by admin
        try {
            (new \App\Services\MailService())->sendPaymentApprovedEmail($payment);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed sending payment approved email on manual verify: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Pembayaran {$id} berhasil disetujui secara manual oleh admin.",
            'data' => $payment,
        ]);
    }

    /**
     * Admin manual reject/cancel override
     */
    public function reject(Request $request, $id)
    {
        $reason = $request->input('reason', 'Dibatalkan oleh administrator.');

        $payment = Payment::where('id', $id)
            ->orWhere('invoice_number', $id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        $payment->update([
            'status' => 'REJECTED',
            'transaction_status' => 'cancel',
            'notes' => $reason,
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
            'message' => "Pembayaran {$id} dibatalkan.",
            'data' => $payment,
        ]);
    }

    /**
     * Simulator endpoint for Evaluators & Dev Mode
     */
    public function simulateApproval(Request $request, $id)
    {
        $payment = Payment::where('id', $id)
            ->orWhere('invoice_number', $id)
            ->first();

        if (!$payment) {
            $user = $this->resolveUser($request);
            $payment = Payment::create([
                'id' => 'PAY-' . date('Y') . '-' . rand(1000, 9999),
                'invoice_number' => $id,
                'user_id' => $user?->id,
                'student_name' => $user?->name ?? 'Mahasiswa Dev',
                'student_email' => $user?->email ?? 'dev@example.com',
                'brevet_id' => 'brevet-ab',
                'brevet_title' => 'Brevet Pajak A & B Terpadu',
                'amount' => 2750000,
                'payment_method' => 'Midtrans Simulator (QRIS Dinamis)',
                'payment_type' => 'qris',
                'transaction_time' => now(),
                'status' => 'PENDING_APPROVAL',
            ]);
        }

        $simulatedPayload = [
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'payment_type' => 'qris',
            'transaction_id' => 'sim-' . uniqid(),
            'settlement_time' => now()->toIso8601String(),
        ];

        $result = $this->midtransService->processStatusUpdate($payment, $simulatedPayload);

        return response()->json([
            'success' => true,
            'message' => 'Simulasi pembayaran Midtrans berhasil disetujui (Settlement).',
            'data' => $result['payment'],
        ]);
    }
}
