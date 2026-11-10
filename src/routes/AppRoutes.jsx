import React, { Suspense, lazy } from 'react';
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

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('../pages/public/HomePage'));
const BrevetCatalogPage = lazy(() => import('../pages/public/BrevetCatalogPage'));
const BrevetDetailPage = lazy(() => import('../pages/public/BrevetDetailPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const BlogPage = lazy(() => import('../pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('../pages/public/BlogDetailPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/public/VerifyEmailPage'));
const CertificateVerifyPage = lazy(() => import('../pages/public/CertificateVerifyPage'));

// Onboarding Pre-Approval / Payment Gateway Screen
const PaymentPendingPage = lazy(() => import('../pages/onboarding/PaymentPendingPage'));

// Student Pages (Modular Architecture - Lazy Loaded)
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const MyCoursesPage = lazy(() => import('../pages/student/pages/MyCoursesPage'));
const CourseLearningPage = lazy(() => import('../pages/student/pages/course/CourseLearningPage'));
const CertificatesPage = lazy(() => import('../pages/student/pages/CertificatesPage'));
const TransactionsPage = lazy(() => import('../pages/student/pages/TransactionsPage'));

// Teacher Pages (Lazy Loaded)
const TeacherDashboardPage = lazy(() => import('../pages/teacher/TeacherDashboardPage'));
const TeacherCoursesPage = lazy(() => import('../pages/teacher/TeacherCoursesPage'));
const TeacherStudentsPage = lazy(() => import('../pages/teacher/TeacherStudentsPage'));

// Admin CMS Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage'));
const AdminStudentsPage = lazy(() => import('../pages/admin/AdminStudentsPage'));
const AdminTeachersPage = lazy(() => import('../pages/admin/AdminTeachersPage'));
const AdminBrevetsPage = lazy(() => import('../pages/admin/AdminBrevetsPage'));
const AdminCertificatesPage = lazy(() => import('../pages/admin/AdminCertificatesPage'));
const AdminEmailTemplatesPage = lazy(() => import('../pages/admin/AdminEmailTemplatesPage'));
const AdminBlogsPage = lazy(() => import('../pages/admin/AdminBlogsPage'));
const AdminContactsPage = lazy(() => import('../pages/admin/AdminContactsPage'));
const AdminCompanyProfilePage = lazy(() => import('../pages/admin/AdminCompanyProfilePage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8 text-center text-slate-500">
    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
    <span className="text-xs font-semibold">Memuat halaman...</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
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
                <StudentDashboard />
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
        <Route path="teachers" element={<AdminTeachersPage />} />
        <Route path="brevets" element={<AdminBrevetsPage />} />
        <Route path="blogs" element={<AdminBlogsPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
        <Route path="company-profile" element={<AdminCompanyProfilePage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
  );
};

export default AppRoutes;
