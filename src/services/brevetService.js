import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

/**
 * Brevet Service - Handles public catalog, syllabus, and course details
 */
export const brevetService = {
  /**
   * Fetch all Brevet programs
   * @returns {Promise<Array>} List of Brevet objects
   */
  async getAllBrevets() {
    const response = await apiClient.get(ENDPOINTS.BREVETS);
    return response.data || [];
  },

  /**
   * Fetch a single Brevet program by slug
   * @param {string} slug 
   * @returns {Promise<Object>}
   */
  async getBrevetBySlug(slug) {
    const response = await apiClient.get(ENDPOINTS.BREVET_DETAIL(slug));
    if (response.data && !Array.isArray(response.data)) {
      return response.data;
    }
    const brevets = response.data || [];
    const found = brevets.find((b) => b.slug === slug || b.id === slug);
    if (!found) {
      throw new Error(`Program Brevet dengan slug "${slug}" tidak ditemukan.`);
    }
    return found;
  },

  /**
   * Fetch a single Brevet program by ID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getBrevetById(id) {
    const response = await apiClient.get(ENDPOINTS.BREVET_DETAIL(id));
    if (response.data && !Array.isArray(response.data)) {
      return response.data;
    }
    const brevets = response.data || [];
    const found = brevets.find((b) => b.id === id);
    if (!found) {
      throw new Error(`Program Brevet dengan ID "${id}" tidak ditemukan.`);
    }
    return found;
  },
};

export default brevetService;
