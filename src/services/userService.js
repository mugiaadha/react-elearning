import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

/**
 * User Service - Handles current user state, RBAC profile, and enrollment status
 */
export const userService = {
  /**
   * Fetch current user profile from real backend API
   */
  async getProfile() {
    const response = await apiClient.get(ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  /**
   * Save or update user profile state in backend
   * @param {Object} updatedProfile 
   */
  async saveProfile(updatedProfile) {
    const response = await apiClient.put(ENDPOINTS.USER_PROFILE, updatedProfile);
    return response.data;
  },

  /**
   * Update student lesson progress
   */
  async updateCourseProgress({ slug, lessonId, completed = true }) {
    const response = await apiClient.post(ENDPOINTS.USER_COURSE_PROGRESS, {
      slug,
      lessonId,
      completed,
    });
    return response.data;
  },

  /**
   * Switch active user role on the backend (for demo & test inspection)
   * @param {string} role 
   * @param {string|null} paymentStatus 
   */
  async switchRole(role, paymentStatus = null) {
    const response = await apiClient.post(ENDPOINTS.AUTH_SWITCH_ROLE, {
      role,
      payment_status: paymentStatus,
    });
    if (response.token) {
      localStorage.setItem('nac_auth_token', response.token);
    }
    return response.data;
  },

  /**
   * Get user enrollments
   */
  async getEnrollments() {
    const response = await apiClient.get(ENDPOINTS.USER_ENROLLMENTS);
    return response.data || [];
  },

  /**
   * Set student's active classroom brevet
   * @param {string} brevetId
   */
  async setActiveBrevet(brevetId) {
    const response = await apiClient.post(ENDPOINTS.USER_SET_ACTIVE_BREVET, { brevet_id: brevetId });
    return response;
  },

  /**
   * Enroll in an additional brevet program
   * @param {string} brevetId
   */
  async enrollBrevet(brevetId) {
    const response = await apiClient.post(ENDPOINTS.USER_ENROLL_BREVET, { brevet_id: brevetId });
    return response;
  },

  /**
   * Request / resend 6-digit OTP verification email via backend SMTP
   * @param {string} email
   */
  async sendVerificationEmail(email) {
    const response = await apiClient.post(ENDPOINTS.AUTH_SEND_VERIFICATION, { email });
    return response;
  },

  /**
   * Verify email OTP with backend database
   * @param {string} email
   * @param {string} code
   */
  async verifyEmail(email, code) {
    const response = await apiClient.post(ENDPOINTS.AUTH_VERIFY_EMAIL, { email, code });
    return response;
  },

  /**
   * Admin: Get all database master email templates
   */
  async getEmailTemplates() {
    const response = await apiClient.get(ENDPOINTS.ADMIN_EMAIL_TEMPLATES);
    return response.data || [];
  },

  /**
   * Admin: Test send an email template via SMTP
   */
  async testSendEmailTemplate(email, templateSlug) {
    const response = await apiClient.post(ENDPOINTS.ADMIN_EMAIL_TEST_SEND, {
      email,
      template_slug: templateSlug,
    });
    return response;
  },
};

export default userService;
