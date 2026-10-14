import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import apiClient from '../services/api/apiClient';
import ENDPOINTS from '../services/api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile from backend API if token exists
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nac_auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (err) {
      console.warn('Failed to load user profile or token expired', err);
      localStorage.removeItem('nac_auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login using real Laravel API endpoint
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH_LOGIN, {
        email,
        password,
      });

      if (response.token) {
        localStorage.setItem('nac_auth_token', response.token);
      }
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Login error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Student registration using real Laravel API endpoint
   */
  const registerStudent = async ({ name, email, phone, password, brevetId, brevetTitle, amount }) => {
    setLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH_REGISTER, {
        name,
        email,
        phone,
        password,
        brevetId,
        brevetTitle,
        amount,
      });

      // We do not immediately set user and token in AuthContext here,
      // so RequireGuest does not prematurely navigate away before the user
      // completes the 6-digit OTP email verification modal.
      return {
        ...response.data,
        token: response.token,
        verification: response.verification,
      };
    } catch (err) {
      console.error('Registration error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout and revoke session token
   */
  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH_LOGOUT);
    } catch (err) {
      console.warn('Backend logout warning:', err);
    } finally {
      localStorage.removeItem('nac_auth_token');
      setUser(null);
    }
  };

  /**
   * Update profile information
   */
  const updateProfile = async (data) => {
    const updated = await userService.saveProfile(data);
    setUser(updated);
    return updated;
  };

  /**
   * Role Switcher backed by real Laravel API (for rapid test inspection)
   */
  const switchRole = async (newRole, newPaymentStatus = null) => {
    try {
      setLoading(true);
      const updated = await userService.switchRole(newRole, newPaymentStatus);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to switch role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick toggle payment approval for student in backend
   */
  const setPaymentStatus = async (status) => {
    try {
      const updated = await userService.saveProfile({ payment_status: status });
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to set payment status', err);
    }
  };

  const refreshProfile = () => {
    return loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        registerStudent,
        logout,
        updateProfile,
        switchRole,
        setPaymentStatus,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
