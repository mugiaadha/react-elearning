<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    /**
     * Get Midtrans Server Key
     */
    public function getServerKey(): string
    {
        return config('services.midtrans.server_key') 
            ?: env('MIDTRANS_SERVER_KEY', env('VITE_MIDTRANS_SERVER_KEY', ''));
    }

    /**
     * Get Midtrans Client Key
     */
    public function getClientKey(): string
    {
        return config('services.midtrans.client_key') 
            ?: env('MIDTRANS_CLIENT_KEY', env('VITE_MIDTRANS_CLIENT_KEY', ''));
    }

    /**
     * Check if production mode
     */
    public function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production', false);
    }

    /**
     * Get Snap API Base URL
     */
    public function getSnapBaseUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    /**
     * Get Core API Base URL for checking status / canceling
     */
    public function getCoreApiBaseUrl(): string
    {
        return $this->isProduction()
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Request a Snap token and payment redirection URL from Midtrans
     */
    public function createSnapTransaction(Payment $payment, ?User $user = null): array
    {
        $serverKey = $this->getServerKey();
        if (empty($serverKey)) {
            throw new \RuntimeException('Midtrans Server Key is not configured.');
        }

        $customerDetails = [
            'first_name' => $payment->student_name ?: ($user?->name ?? 'Mahasiswa NAC'),
            'email' => $payment->student_email ?: ($user?->email ?? 'student@nactaxcenter.id'),
            'phone' => $payment->student_phone ?: ($user?->phone ?? '081200000000'),
        ];

        $payload = [
            'transaction_details' => [
                'order_id' => $payment->invoice_number,
                'gross_amount' => (int) $payment->amount,
            ],
            'customer_details' => $customerDetails,
            'item_details' => [
                [
                    'id' => $payment->brevet_id,
                    'price' => (int) $payment->amount,
                    'quantity' => 1,
                    'name' => mb_strimwidth($payment->brevet_title ?: 'Program Pelatihan Brevet Pajak', 0, 50, '...'),
                ],
            ],
            'usage_limit' => 1,
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->timeout(15)
                ->post($this->getSnapBaseUrl(), $payload);

            if ($response->successful()) {
                $data = $response->json();
                $snapToken = $data['token'] ?? null;
                $redirectUrl = $data['redirect_url'] ?? null;

                $payment->update([
                    'snap_token' => $snapToken,
                    'snap_redirect_url' => $redirectUrl,
                    'metadata' => array_merge($payment->metadata ?? [], ['snap_response' => $data]),
                ]);

                return [
                    'success' => true,
                    'token' => $snapToken,
                    'redirect_url' => $redirectUrl,
                ];
            }

            Log::error('Midtrans Snap Error: ' . $response->body(), ['payload' => $payload]);
            return [
                'success' => false,
                'message' => 'Gagal membuat sesi pembayaran Midtrans: ' . ($response->json('error_messages')[0] ?? $response->body()),
            ];
        } catch (\Throwable $e) {
            Log::error('Midtrans Connection Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke Midtrans terganggu: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Query live transaction status from Midtrans API
     */
    public function getTransactionStatus(string $orderId): ?array
    {
        $serverKey = $this->getServerKey();
        if (empty($serverKey)) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Accept' => 'application/json'])
                ->timeout(15)
                ->get($this->getCoreApiBaseUrl() . '/' . $orderId . '/status');

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning("Midtrans check status ({$orderId}) returned {$response->status()}: " . $response->body());
            return null;
        } catch (\Throwable $e) {
            Log::error("Midtrans check status exception ({$orderId}): " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify Midtrans notification signature
     * signature = SHA512(order_id + status_code + gross_amount + ServerKey)
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $this->getServerKey());
        return hash_equals($expected, $signatureKey);
    }

    /**
     * Synchronize and process transaction status in Database
     * Handles webhook notification or direct status check
     */
    public function processStatusUpdate(Payment $payment, array $payload): array
    {
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? $payment->payment_type ?? 'midtrans';
        $transactionId = $payload['transaction_id'] ?? $payment->transaction_id;
        $settlementTime = isset($payload['settlement_time'])
            ? Carbon::parse($payload['settlement_time'])
            : ($payment->settlement_time ?? null);

        // Determine mapped LMS status
        $appStatus = $payment->status; // fallback to current

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'challenge') {
                $appStatus = 'PENDING_APPROVAL';
            } elseif ($fraudStatus === 'accept') {
                $appStatus = 'APPROVED';
                $settlementTime = $settlementTime ?: now();
            }
        } elseif ($transactionStatus === 'settlement') {
            $appStatus = 'APPROVED';
            $settlementTime = $settlementTime ?: now();
        } elseif ($transactionStatus === 'pending') {
            $appStatus = 'PENDING_APPROVAL';
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $appStatus = 'REJECTED';
        }

        // Friendly payment method name based on Midtrans payment_type
        $paymentMethodLabel = match ($paymentType) {
            'qris' => 'QRIS (GoPay / ShopeePay / Bank Apps)',
            'gopay' => 'GoPay Dinamis',
            'shopeepay' => 'ShopeePay Dinamis',
            'bank_transfer' => isset($payload['va_numbers'][0]['bank'])
                ? strtoupper($payload['va_numbers'][0]['bank']) . ' Virtual Account'
                : (isset($payload['permata_va_number']) ? 'Permata Virtual Account' : 'Virtual Account'),
            'echannel' => 'Mandiri Bill Payment (E-Channel)',
            'bca_va' => 'BCA Virtual Account',
            'bni_va' => 'BNI Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'cstore' => 'Convenience Store (' . ($payload['store'] ?? 'Retail') . ')',
            'credit_card' => 'Kartu Kredit / Debit Online',
            default => $payment->payment_method ?: 'Midtrans Payment Gateway',
        };

        $updateData = [
            'payment_method' => $paymentMethodLabel,
            'payment_type' => $paymentType,
            'transaction_id' => $transactionId,
            'transaction_status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
            'status' => $appStatus,
            'settlement_time' => $settlementTime,
            'metadata' => array_merge($payment->metadata ?? [], ['latest_payload' => $payload]),
        ];

        if ($appStatus === 'APPROVED' && !$payment->approved_at) {
            $updateData['approved_at'] = now();
        }

        $payment->update($updateData);

        // Update corresponding User & Enrollment
        if ($payment->user_id) {
            $user = User::find($payment->user_id);
            if ($user) {
                if ($appStatus === 'APPROVED') {
                    $user->update(['payment_status' => 'APPROVED']);
                }

                $enrollment = Enrollment::where('invoice_number', $payment->invoice_number)->first()
                    ?? Enrollment::where('user_id', $user->id)->where('brevet_id', $payment->brevet_id)->first()
                    ?? $user->activeEnrollment;

                if ($enrollment) {
                    $enrollmentUpdate = [
                        'payment_status' => $appStatus,
                        'payment_method' => $paymentMethodLabel,
                    ];

                    if ($appStatus === 'APPROVED') {
                        // Check if student already has an active classroom
                        $hasActive = $user->enrollments()->where('is_active', true)->where('id', '!=', $enrollment->id)->exists();
                        $shouldActivate = !$hasActive;
                        if ($shouldActivate) {
                            Enrollment::where('user_id', $user->id)->where('id', '!=', $enrollment->id)->update(['is_active' => false]);
                        }
                        $enrollmentUpdate['is_active'] = $shouldActivate;
                    } elseif ($appStatus === 'REJECTED') {
                        $enrollmentUpdate['is_active'] = false;
                    }

                    $enrollment->update($enrollmentUpdate);
                }
            }
        }

        return [
            'payment' => $payment->fresh(),
            'status' => $appStatus,
            'transaction_status' => $transactionStatus,
        ];
    }
}

