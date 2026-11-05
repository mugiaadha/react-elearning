/**
 * Centralized API Endpoints Contract
 * 
 * 100% connected to real Laravel REST API at http://127.0.0.1:8000/api
 */
export const ENDPOINTS = {
  // Public Brevets & Batches
  BREVETS: '/brevets',
  BREVET_DETAIL: (idOrSlug) => `/brevets/${idOrSlug}`,

  // Auth & User Profile
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_GOOGLE: '/auth/google',
  AUTH_GOOGLE_URL: '/auth/google/url',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_SWITCH_ROLE: '/auth/switch-role',
  AUTH_SEND_VERIFICATION: '/auth/send-verification',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  USER_PROFILE: '/user/profile',
  USER_ENROLLMENTS: '/user/enrollments',
  USER_SET_ACTIVE_BREVET: '/user/set-active-brevet',
  USER_ENROLL_BREVET: '/user/enroll-brevet',
  USER_COURSE_PROGRESS: '/user/course-progress',
  USER_COURSE_PROGRESS_RESET: '/user/course-progress/reset',

  // Email Master Templates (SMTP)
  ADMIN_EMAIL_TEMPLATES: '/admin/email-templates',
  ADMIN_EMAIL_TEMPLATE: (id) => `/admin/email-templates/${id}`,
  ADMIN_EMAIL_TEST_SEND: '/admin/email-templates/test-send',

  // Payments & Midtrans Gateway
  PAYMENT_SNAP_TOKEN: '/payments/snap-token',
  PAYMENT_STATUS: (orderId) => `/payments/${orderId}/status`,
  PAYMENT_SYNC: (orderId) => `/payments/${orderId}/sync`,
  PAYMENT_SIMULATE: (orderId) => `/payments/${orderId}/simulate-approval`,
  ADMIN_PENDING_PAYMENTS: '/admin/payments',
  ADMIN_VERIFY_PAYMENT: (paymentId) => `/admin/payments/${paymentId}/verify`,
  ADMIN_REJECT_PAYMENT: (paymentId) => `/admin/payments/${paymentId}/reject`,

  // Admin CMS & Stats
  ADMIN_STATS: '/admin/stats',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_TEACHER_RESEND_INVITE: (id) => `/admin/teachers/${id}/resend-invitation`,
  ADMIN_TEACHER_DELETE: (id) => `/admin/teachers/${id}`,

  // Certificates
  CERTIFICATES: '/certificates',
  CERTIFICATE_VERIFY: (certId) => `/certificates/${certId}/verify`,

  // Teacher Portal
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_BREVETS: '/teacher/brevets',
  TEACHER_BREVET_BATCHES: (brevetId) => `/teacher/brevets/${brevetId}/batches`,
  TEACHER_STORE_MODULE: (brevetId) => `/teacher/brevets/${brevetId}/modules`,
  TEACHER_UPDATE_MODULE: (brevetId, moduleId) => `/teacher/brevets/${brevetId}/modules/${moduleId}`,
  TEACHER_DELETE_MODULE: (brevetId, moduleId) => `/teacher/brevets/${brevetId}/modules/${moduleId}`,
  TEACHER_STORE_LESSON: (brevetId, moduleId) => `/teacher/brevets/${brevetId}/modules/${moduleId}/lessons`,
  TEACHER_DELETE_LESSON: (brevetId, moduleId, lessonId) => `/teacher/brevets/${brevetId}/modules/${moduleId}/lessons/${lessonId}`,
  TEACHER_MATERIALS: '/teacher/materials',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_SUBMISSIONS: '/teacher/submissions',
  TEACHER_REVIEW_SUBMISSION: (id) => `/teacher/submissions/${id}/review`,
  TEACHER_GRADE: (submissionId) => `/teacher/submissions/${submissionId}/grade`,

  // Student Submissions & Exams
  USER_SUBMISSIONS: '/user/submissions',
  USER_SUBMIT_EXAM: '/user/submissions',

  // Public Contact
  CONTACT: '/contact',
};

export default ENDPOINTS;
