<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrevetController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

$registerRoutes = function () {
    // 1. Auth & User Profile
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::match(['put', 'post'], '/user/profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/enrollments', [AuthController::class, 'enrollments']);
    Route::post('/user/course-progress', [AuthController::class, 'updateProgress']);

    // 2. Email Verification & Master Template Mailing
    Route::post('/auth/send-verification', [EmailVerificationController::class, 'send']);
    Route::post('/auth/verify-email', [EmailVerificationController::class, 'verify']);
    Route::get('/admin/email-templates', [EmailVerificationController::class, 'listTemplates']);
    Route::get('/admin/email-templates/{id}', [EmailVerificationController::class, 'getTemplate']);
    Route::put('/admin/email-templates/{id}', [EmailVerificationController::class, 'updateTemplate']);
    Route::post('/admin/email-templates/test-send', [EmailVerificationController::class, 'testSend']);

    // 3. Brevet Courses
    Route::get('/brevets', [BrevetController::class, 'index']);
    Route::get('/brevets/{idOrSlug}', [BrevetController::class, 'show']);

    // 4. Certificates & Public Verification
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certId}', [CertificateController::class, 'show']);
    Route::get('/certificates/{certId}/verify', [CertificateController::class, 'show']);
    Route::post('/certificates', [CertificateController::class, 'store']);

    // 5. Payments
    Route::post('/payments/proof', [PaymentController::class, 'uploadProof']);
    Route::get('/admin/payments/pending', [PaymentController::class, 'pending']);
    Route::get('/admin/pending-payments', [PaymentController::class, 'pending']);
    Route::post('/admin/payments/{id}/verify', [PaymentController::class, 'verify']);
    Route::post('/admin/payments/{id}/reject', [PaymentController::class, 'reject']);

    // 6. Admin Backoffice CMS
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/students', [AdminController::class, 'students']);

    // 7. Teacher Portal
    Route::get('/teacher/students', [TeacherController::class, 'students']);
    Route::get('/teacher/materials', [TeacherController::class, 'materials']);
    Route::post('/teacher/materials', [TeacherController::class, 'storeMaterial']);
    Route::get('/teacher/dashboard', [TeacherController::class, 'dashboard']);
    Route::post('/teacher/submissions/{id}/grade', [TeacherController::class, 'gradeSubmission']);

    // 8. Contact
    Route::post('/contact', [ContactController::class, 'store']);
};

// Register directly under /api/...
$registerRoutes();

// Also register under /api/v1/... for backwards & forwards compatibility
Route::prefix('v1')->group($registerRoutes);
