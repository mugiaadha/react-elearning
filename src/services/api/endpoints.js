/**
 * Centralized API Endpoints Contract
 * 
 * Connected to Laravel REST API at http://127.0.0.1:8000/api
 */
const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK_API === 'true';

export const ENDPOINTS = {
  // Public Brevets
  BREVETS: IS_MOCK_MODE ? '/api/brevets.json' : '/brevets',
  BREVET_DETAIL: (idOrSlug) =>
    IS_MOCK_MODE ? '/api/brevets.json' : `/brevets/${idOrSlug}`,

  // Auth & User Profile
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_SWITCH_ROLE: '/auth/switch-role',
  AUTH_SEND_VERIFICATION: '/auth/send-verification',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  USER_PROFILE: IS_MOCK_MODE ? '/api/user/profile.json' : '/user/profile',
  USER_ENROLLMENTS: IS_MOCK_MODE ? '/api/user/enrollments.json' : '/user/enrollments',
  USER_COURSE_PROGRESS: '/user/course-progress',

  // Email Master Templates (SMTP)
  ADMIN_EMAIL_TEMPLATES: '/admin/email-templates',
  ADMIN_EMAIL_TEMPLATE: (id) => `/admin/email-templates/${id}`,
  ADMIN_EMAIL_TEST_SEND: '/admin/email-templates/test-send',

  // Payments & Onboarding
  PAYMENT_PROOF_UPLOAD: IS_MOCK_MODE ? '/api/user/profile.json' : '/payments/proof',
  ADMIN_PENDING_PAYMENTS: IS_MOCK_MODE ? '/api/admin/pending-payments.json' : '/admin/payments/pending',
  ADMIN_VERIFY_PAYMENT: (paymentId) => `/admin/payments/${paymentId}/verify`,
  ADMIN_REJECT_PAYMENT: (paymentId) => `/admin/payments/${paymentId}/reject`,

  // Admin CMS & Stats
  ADMIN_STATS: IS_MOCK_MODE ? '/api/admin/stats.json' : '/admin/stats',
  ADMIN_STUDENTS: '/admin/students',

  // Certificates
  CERTIFICATES: IS_MOCK_MODE ? '/api/certificates.json' : '/certificates',
  CERTIFICATE_VERIFY: (certId) => `/certificates/${certId}/verify`,

  // Teacher Portal
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_MATERIALS: '/teacher/materials',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_GRADE: (submissionId) => `/teacher/submissions/${submissionId}/grade`,

  // Public Contact
  CONTACT: '/contact',
};

export default ENDPOINTS;
