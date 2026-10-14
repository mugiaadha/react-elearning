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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-nac-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Memverifikasi sesi...</p>
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

  if (loading) return null;

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'teacher') {
      return <Navigate to="/dashboard/teacher" replace />;
    }
    // Student
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

  if (loading) return null;

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
 * Redirects student to /onboarding/payment-pending
 */
export const PaymentApprovalGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only enforces for students
  if (user.role === 'student' && user.payment_status !== 'APPROVED') {
    return <Navigate to="/onboarding/payment-pending" replace />;
  }

  return children;
};

/**
 * Guard 5: Onboarding Guard
 * If student is already APPROVED, prevent them from lingering in payment-pending and send them to dashboard
 */
export const OnboardingGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user && user.role === 'student' && user.payment_status === 'APPROVED') {
    return <Navigate to="/dashboard/student" replace />;
  }

  return children;
};
