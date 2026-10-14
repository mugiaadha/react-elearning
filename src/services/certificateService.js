import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

export const certificateService = {
  /**
   * Get all verified certificates
   */
  async getAllCertificates() {
    const res = await apiClient.get(ENDPOINTS.CERTIFICATES);
    return res.data || [];
  },

  /**
   * Verify certificate by ID (Public QR check)
   * @param {string} certId 
   */
  async verifyCertificate(certId) {
    const cleanId = certId.trim().toUpperCase();
    try {
      const res = await apiClient.get(ENDPOINTS.CERTIFICATE_VERIFY(cleanId));
      return {
        isValid: res.isValid ?? true,
        certificate: res.certificate || res.data,
        message: res.message || 'Sertifikat resmi dan terdaftar sah di pangkalan data NAC Tax Center.',
      };
    } catch (err) {
      return {
        isValid: false,
        certificate: null,
        message: err.message || `Sertifikat dengan ID "${certId}" tidak terdaftar di sistem NAC Tax Center.`,
      };
    }
  },

  /**
   * Issue digital certificate for student upon 100% completion
   */
  async issueCertificate({ studentName, courseTitle, score = 95.0 }) {
    const res = await apiClient.post(ENDPOINTS.CERTIFICATES, {
      studentName,
      courseTitle,
      score,
    });
    return res.data;
  },
};

export default certificateService;
