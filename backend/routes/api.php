<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BrevetController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

$registerRoutes = function () {
    // 1. Auth & User Profile
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::get('/auth/google/url', [AuthController::class, 'googleAuthUrl']);
    Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::post('/auth/google/config', [AuthController::class, 'saveGoogleConfig']);
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);
    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::match(['put', 'post'], '/user/profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/enrollments', [AuthController::class, 'enrollments']);
    Route::post('/user/set-active-brevet', [AuthController::class, 'setActiveBrevet']);
    Route::post('/user/enroll-brevet', [AuthController::class, 'enrollBrevet']);
    Route::post('/user/course-progress', [AuthController::class, 'updateProgress']);
    Route::post('/user/course-progress/reset', [AuthController::class, 'resetCourseProgress']);
    Route::get('/user/submissions', [AuthController::class, 'userSubmissions']);
    Route::post('/user/submissions', [AuthController::class, 'submitExam']);

    // 2. Email Verification & Master Template Mailing
    Route::post('/auth/send-verification', [EmailVerificationController::class, 'send']);
    Route::post('/auth/verify-email', [EmailVerificationController::class, 'verify']);
    Route::get('/admin/email-templates', [EmailVerificationController::class, 'listTemplates']);
    Route::get('/admin/email-templates/{id}', [EmailVerificationController::class, 'getTemplate']);
    Route::put('/admin/email-templates/{id}', [EmailVerificationController::class, 'updateTemplate']);
    Route::post('/admin/email-templates/test-send', [EmailVerificationController::class, 'testSend']);

    // 3. Brevet Courses & Batches
    Route::get('/brevets', [BrevetController::class, 'index']);
    Route::get('/brevets/{idOrSlug}', [BrevetController::class, 'show']);
    Route::get('/brevets/{idOrSlug}/batches', [BrevetController::class, 'batches']);

    // 4. Certificates & Public Verification
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certId}', [CertificateController::class, 'show']);
    Route::get('/certificates/{certId}/verify', [CertificateController::class, 'show']);
    Route::post('/certificates', [CertificateController::class, 'store']);

    // 5. Midtrans Payments Gateway & Monitoring
    Route::post('/payments/snap-token', [PaymentController::class, 'createSnapToken']);
    Route::post('/payments/notification', [PaymentController::class, 'handleNotification']);
    Route::post('/payments/webhook', [PaymentController::class, 'handleNotification']);
    Route::get('/payments/{orderId}/status', [PaymentController::class, 'checkStatus']);
    Route::post('/payments/{orderId}/sync', [PaymentController::class, 'checkStatus']);
    Route::post('/payments/{orderId}/simulate-approval', [PaymentController::class, 'simulateApproval']);
    Route::get('/admin/payments', [PaymentController::class, 'pending']);
    Route::get('/admin/payments/pending', [PaymentController::class, 'pending']);
    Route::get('/admin/pending-payments', [PaymentController::class, 'pending']);
    Route::post('/admin/payments/{id}/verify', [PaymentController::class, 'verify']);
    Route::post('/admin/payments/{id}/reject', [PaymentController::class, 'reject']);

    // 6. Admin Backoffice CMS
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/students', [AdminController::class, 'students']);
    Route::get('/admin/teachers', [AdminController::class, 'teachers']);
    Route::post('/admin/teachers', [AdminController::class, 'createTeacher']);
    Route::post('/admin/teachers/{id}/resend-invitation', [AdminController::class, 'resendTeacherInvitation']);
    Route::delete('/admin/teachers/{id}', [AdminController::class, 'deleteTeacher']);

    // 7. Teacher Portal
    Route::get('/teacher/teachers', [TeacherController::class, 'teacherList']);
    Route::get('/teacher/students', [TeacherController::class, 'students']);
    Route::get('/teacher/brevets', [TeacherController::class, 'brevets']);
    Route::post('/teacher/brevets', [TeacherController::class, 'storeBrevet']);
    Route::get('/teacher/brevets/{id}/batches', [TeacherController::class, 'batches']);
    Route::post('/teacher/brevets/{id}/batches', [TeacherController::class, 'storeBatch']);
    Route::put('/teacher/brevets/{id}/batches/{batchId}', [TeacherController::class, 'updateBatch']);
    Route::put('/teacher/batches/{batchId}', [TeacherController::class, 'updateBatch']);
    Route::post('/teacher/brevets/{id}/modules', [TeacherController::class, 'storeModule']);
    Route::put('/teacher/brevets/{id}/modules/{moduleId}', [TeacherController::class, 'updateModule']);
    Route::delete('/teacher/brevets/{id}/modules/{moduleId}', [TeacherController::class, 'deleteModule']);
    Route::post('/teacher/brevets/{id}/modules/{moduleId}/lessons', [TeacherController::class, 'storeLesson']);
    Route::delete('/teacher/brevets/{id}/modules/{moduleId}/lessons/{lessonId}', [TeacherController::class, 'deleteLesson']);
    Route::get('/teacher/materials', [TeacherController::class, 'materials']);
    Route::post('/teacher/materials', [TeacherController::class, 'storeMaterial']);
    Route::get('/teacher/dashboard', [TeacherController::class, 'dashboard']);
    Route::get('/teacher/submissions', [TeacherController::class, 'submissions']);
    Route::post('/teacher/submissions/{id}/review', [TeacherController::class, 'reviewSubmission']);
    Route::post('/teacher/submissions/{id}/grade', [TeacherController::class, 'gradeSubmission']);

    // 8. Contact
    Route::post('/contact', [ContactController::class, 'store']);

    // 9. Blog & Tax Insights CMS (Public & Backoffice)
    Route::get('/blogs/captcha/challenge', [BlogController::class, 'generateCaptcha']);
    Route::get('/blogs', [BlogController::class, 'index']);
    Route::get('/blogs/{slugOrId}', [BlogController::class, 'show']);
    Route::post('/blogs/{slugOrId}/ask', [BlogController::class, 'askQuestion']);
    Route::get('/admin/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/admin/blogs', [BlogController::class, 'store']);
    Route::match(['put', 'post'], '/admin/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/admin/blogs/{id}', [BlogController::class, 'destroy']);

    // 10. Company Profile (Cached Public & Admin Update)
    Route::get('/company-profile', [CompanyProfileController::class, 'show']);
    Route::match(['put', 'post'], '/admin/company-profile', [CompanyProfileController::class, 'update']);
};

// Register directly under /api/...
$registerRoutes();

// Also register under /api/v1/... for backwards & forwards compatibility
Route::prefix('v1')->group($registerRoutes);
