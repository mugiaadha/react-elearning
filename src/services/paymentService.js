import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

export const paymentService = {
  /**
   * Request Midtrans Snap Token for an invoice / brevet course
   */
  async createSnapToken({ invoiceId, brevetId } = {}) {
    const response = await apiClient.post(ENDPOINTS.PAYMENT_SNAP_TOKEN, {
      invoiceId,
      brevetId,
    });
    return {
      success: true,
      message: response.message || 'Sesi pembayaran Midtrans berhasil dibuat.',
      data: response.data,
    };
  },

  /**
   * Check latest status of an order directly from backend & Midtrans API
   */
  async checkPaymentStatus(orderId) {
    const response = await apiClient.get(ENDPOINTS.PAYMENT_STATUS(orderId));
    return {
      success: true,
      message: response.message || 'Status pembayaran berhasil diperoleh.',
      data: response.data,
    };
  },

  /**
   * Synchronize payment status with Midtrans Core API
   */
  async syncPayment(orderId) {
    const response = await apiClient.post(ENDPOINTS.PAYMENT_SYNC(orderId));
    return {
      success: true,
      message: response.message || 'Status pembayaran berhasil disinkronkan.',
      data: response.data,
    };
  },

  /**
   * Dev Mode / Evaluator simulation: instantly approve payment
   */
  async simulateApproval(orderId) {
    const response = await apiClient.post(ENDPOINTS.PAYMENT_SIMULATE(orderId));
    return {
      success: true,
      message: response.message || 'Simulasi pembayaran berhasil.',
      data: response.data,
    };
  },

  /**
   * Get all transactions for admin monitoring
   */
  async getPendingPayments() {
    const response = await apiClient.get(ENDPOINTS.ADMIN_PENDING_PAYMENTS);
    return response.data || [];
  },

  /**
   * Admin manual approve override
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
   * Admin manual reject override
   */
  async rejectPayment(paymentId, reason = 'Dibatalkan oleh admin') {
    const response = await apiClient.post(ENDPOINTS.ADMIN_REJECT_PAYMENT(paymentId), { reason });
    return {
      success: true,
      message: response.message || `Pembayaran ${paymentId} dibatalkan.`,
      data: response.data,
    };
  },
};

export default paymentService;
