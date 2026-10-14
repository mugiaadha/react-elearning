import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import FrontofficePublicLayout from '../layouts/FrontofficePublicLayout';
import FrontofficePortalLayout from '../layouts/FrontofficePortalLayout';
import BackofficeLayout from '../layouts/BackofficeLayout';

// Route Guards
import {
  RequireAuth,
  RequireGuest,
  RequireRole,
  PaymentApprovalGuard,
  OnboardingGuard,
} from './RouteGuards';

// Public Pages
import HomePage from '../pages/public/HomePage';
import BrevetCatalogPage from '../pages/public/BrevetCatalogPage';
import BrevetDetailPage from '../pages/public/BrevetDetailPage';
import AboutPage from '../pages/public/AboutPage';
import BlogPage from '../pages/public/BlogPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import CertificateVerifyPage from '../pages/public/CertificateVerifyPage';

// Onboarding Pre-Approval Page
import PaymentPendingPage from '../pages/onboarding/PaymentPendingPage';

// Student Pages
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import MyCoursesPage from '../pages/student/MyCoursesPage';
import CourseLearningPage from '../pages/student/CourseLearningPage';
import CertificatesPage from '../pages/student/CertificatesPage';
import TransactionsPage from '../pages/student/TransactionsPage';

// Teacher Pages
import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage';
import TeacherCoursesPage from '../pages/teacher/TeacherCoursesPage';
import TeacherStudentsPage from '../pages/teacher/TeacherStudentsPage';

// Admin CMS Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminStudentsPage from '../pages/admin/AdminStudentsPage';
import AdminBrevetsPage from '../pages/admin/AdminBrevetsPage';
import AdminCertificatesPage from '../pages/admin/AdminCertificatesPage';
import AdminEmailTemplatesPage from '../pages/admin/AdminEmailTemplatesPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================================
          1. FRONTOFFICE PUBLIC NAVIGATION (Unauthenticated)
          ======================================================== */}
      <Route element={<FrontofficePublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/brevet" element={<BrevetCatalogPage />} />
        <Route path="/brevet/:slug" element={<BrevetDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
        <Route
          path="/verify-certificate/:certId?"
          element={<CertificateVerifyPage />}
        />

        {/* Onboarding Pre-Approval / Payment Gateway Screen */}
        <Route
          path="/onboarding/payment-pending"
          element={
            <RequireAuth>
              <OnboardingGuard>
                <PaymentPendingPage />
              </OnboardingGuard>
            </RequireAuth>
          }
        />
      </Route>

      {/* ========================================================
          2. FRONTOFFICE PORTAL (Authenticated Student & Teacher)
          ======================================================== */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <FrontofficePortalLayout />
          </RequireAuth>
        }
      >
        {/* Student Portal - Protected with RBAC & PaymentApprovalGuard */}
        <Route
          path="student"
          element={
            <RequireRole allowedRoles={['student']}>
              <PaymentApprovalGuard>
                <StudentDashboardPage />
              </PaymentApprovalGuard>
            </RequireRole>
          }
        />
        <Route
          path="student/my-courses"
          element={
            <RequireRole allowedRoles={['student']}>
              <PaymentApprovalGuard>
                <MyCoursesPage />
              </PaymentApprovalGuard>
            </RequireRole>
          }
        />
        <Route
          path="student/course/:slug"
          element={
            <RequireRole allowedRoles={['student', 'teacher', 'admin']}>
              <PaymentApprovalGuard>
                <CourseLearningPage />
              </PaymentApprovalGuard>
            </RequireRole>
          }
        />
        <Route
          path="student/certificates"
          element={
            <RequireRole allowedRoles={['student']}>
              <PaymentApprovalGuard>
                <CertificatesPage />
              </PaymentApprovalGuard>
            </RequireRole>
          }
        />
        <Route
          path="student/transactions"
          element={
            <RequireRole allowedRoles={['student']}>
              <PaymentApprovalGuard>
                <TransactionsPage />
              </PaymentApprovalGuard>
            </RequireRole>
          }
        />

        {/* Teacher Portal */}
        <Route
          path="teacher"
          element={
            <RequireRole allowedRoles={['teacher']}>
              <TeacherDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="teacher/courses"
          element={
            <RequireRole allowedRoles={['teacher']}>
              <TeacherCoursesPage />
            </RequireRole>
          }
        />
        <Route
          path="teacher/students"
          element={
            <RequireRole allowedRoles={['teacher']}>
              <TeacherStudentsPage />
            </RequireRole>
          }
        />
      </Route>

      {/* ========================================================
          3. BACKOFFICE LAYOUT (Strictly Admin CMS)
          ======================================================== */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['admin']}>
              <BackofficeLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="brevets" element={<AdminBrevetsPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
