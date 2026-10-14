import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

export const paymentService = {
  /**
   * Get all pending payments for admin review
   */
  async getPendingPayments() {
    const response = await apiClient.get(ENDPOINTS.ADMIN_PENDING_PAYMENTS);
    return response.data || [];
  },

  /**
   * Submit payment proof (Student flow)
   * Updates student's invoice and sets payment status to PENDING_APPROVAL
   */
  async submitPaymentProof({ invoiceId, proofImageUrl, notes, file }) {
    let payload;

    if (file) {
      payload = new FormData();
      payload.append('invoiceId', invoiceId);
      payload.append('proof_image', file);
      if (proofImageUrl) payload.append('proofImageUrl', proofImageUrl);
      if (notes) payload.append('notes', notes);
    } else {
      payload = {
        invoiceId,
        proofImageUrl: proofImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        notes: notes || 'Bukti transfer diunggah via portal',
      };
    }

    const response = await apiClient.post(ENDPOINTS.PAYMENT_PROOF_UPLOAD, payload);
    return {
      success: true,
      message: response.message || 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.',
      data: response.data,
    };
  },

  /**
   * Admin approves student payment
   * Status transitions: PENDING_APPROVAL -> APPROVED (ACTIVE)
   */
  async approvePayment(paymentId) {
    const response = await apiClient.post(ENDPOINTS.ADMIN_VERIFY_PAYMENT(paymentId));
    return {
      success: true,
      message: response.message || `Pembayaran ${paymentId} berhasil diverifikasi & disetujui.`,
      data: response.data,
    };
  },

  /**
   * Admin rejects student payment
   */
  async rejectPayment(paymentId, reason = 'Bukti transfer tidak valid atau tidak terbaca') {
    const response = await apiClient.post(ENDPOINTS.ADMIN_REJECT_PAYMENT(paymentId), { reason });
    return {
      success: true,
      message: response.message || `Pembayaran ${paymentId} ditolak.`,
      data: response.data,
    };
  },
};

export default paymentService;
