import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard 1: Requires authentication
 */
export const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-nac-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold tracking-wide">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Guard 2: Require Guest (Redirects logged-in users away from /login and /register)
 */
export const RequireGuest = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-2xl w-2/3 mx-auto"></div>
          <div className="h-3.5 bg-slate-100 rounded-lg w-1/2 mx-auto"></div>
          <div className="space-y-3 pt-6">
            <div className="h-11 bg-slate-100 rounded-2xl w-full"></div>
            <div className="h-11 bg-slate-100 rounded-2xl w-full"></div>
            <div className="h-12 bg-slate-200/70 rounded-2xl w-full mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'teacher') {
      return <Navigate to="/dashboard/teacher" replace />;
    }
    // Student progression check
    if (!user.email_verified_at) {
      return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
    }
    if (user.payment_status !== 'APPROVED') {
      return <Navigate to="/onboarding/payment-pending" replace />;
    }
    return <Navigate to="/dashboard/student" replace />;
  }

  return children;
};

/**
 * Guard 3: Role-Based Access Control (RBAC)
 */
export const RequireRole = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-nac-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium">Memuat akses akun...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If student tries to access admin, redirect to student dashboard or home
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return children;
};

/**
 * Guard 4: Payment Pre-Approval Guard (Critical Requirement)
 * Blocks student from accessing the real Student Dashboard if payment_status !== 'APPROVED'
 * Redirects student to /onboarding/payment-pending or /verify-email if unverified
 */
export const PaymentApprovalGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-nac-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium">Memeriksa status pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only enforces for students
  if (user.role === 'student') {
    if (!user.email_verified_at) {
      return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
    }
    if (user.payment_status !== 'APPROVED') {
      return <Navigate to="/onboarding/payment-pending" replace />;
    }
  }

  return children;
};

/**
 * Guard 5: Onboarding Guard
 * Ensures student has verified email first, and if already APPROVED, send them to dashboard
 */
export const OnboardingGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-nac-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium">Memuat proses registrasi...</p>
        </div>
      </div>
    );
  }

  if (user && user.role === 'student') {
    if (!user.email_verified_at) {
      return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
    }
    if (user.payment_status === 'APPROVED') {
      return <Navigate to="/dashboard/student" replace />;
    }
  }

  return children;
};
