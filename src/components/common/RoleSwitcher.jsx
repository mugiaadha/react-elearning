import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  UserCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (!user) return null;

  const isStudent = user.role === 'student';
  const isApproved = user.payment_status === 'APPROVED';

  const handleSelectRole = (role, status = null, targetPath = null) => {
    switchRole(role, status);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="bg-slate-950 text-white text-xs border-b border-slate-800 shadow-md z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Role indicator */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-nac-navy text-nac-accent font-semibold border border-nac-accent/30 text-[10px] sm:text-[11px] shrink-0">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">RBAC</span> Simulator
            </span>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Role:</span>
              <span className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                {user.role}
              </span>

              {isStudent && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 shrink-0 ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
                    </>
                  ) : (
                    <>
                      <Clock className="w-2.5 h-2.5 animate-pulse" /> PENDING
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Right: Role buttons (Desktop: inline; Mobile: toggle button or horizontal pills) */}
          <div className="flex items-center gap-1">
            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-400 mr-1 text-[11px]">Ganti Peran:</span>

              {/* 1. Student Pending */}
              <button
                type="button"
                onClick={() =>
                  handleSelectRole('student', 'PENDING_APPROVAL', '/onboarding/payment-pending')
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isStudent && !isApproved
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Student (Pending)
              </button>

              {/* 2. Student Active */}
              <button
                type="button"
                onClick={() =>
                  handleSelectRole('student', 'APPROVED', '/dashboard/student')
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isStudent && isApproved
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Student (Active)
              </button>

              {/* 3. Teacher */}
              <button
                type="button"
                onClick={() => handleSelectRole('teacher', 'APPROVED', '/dashboard/teacher')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  user.role === 'teacher'
                    ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Teacher
              </button>

              {/* 4. Admin */}
              <button
                type="button"
                onClick={() => handleSelectRole('admin', 'APPROVED', '/admin/dashboard')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  user.role === 'admin'
                    ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin (Backoffice)
              </button>
            </div>

            {/* Mobile / Tablet Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
              aria-label="Pilih Peran Demo"
            >
              <span>Ubah Peran</span>
              {mobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Drawer / Button Grid */}
        {mobileExpanded && (
          <div className="lg:hidden mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => {
                handleSelectRole('student', 'PENDING_APPROVAL', '/onboarding/payment-pending');
                setMobileExpanded(false);
              }}
              className={`p-2 rounded-lg text-[11px] font-semibold text-center transition ${
                isStudent && !isApproved
                  ? 'bg-amber-600 text-white shadow ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Student (Pending)
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectRole('student', 'APPROVED', '/dashboard/student');
                setMobileExpanded(false);
              }}
              className={`p-2 rounded-lg text-[11px] font-semibold text-center transition ${
                isStudent && isApproved
                  ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Student (Active)
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectRole('teacher', 'APPROVED', '/dashboard/teacher');
                setMobileExpanded(false);
              }}
              className={`p-2 rounded-lg text-[11px] font-semibold text-center transition ${
                user.role === 'teacher'
                  ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Teacher (Guru)
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectRole('admin', 'APPROVED', '/admin/dashboard');
                setMobileExpanded(false);
              }}
              className={`p-2 rounded-lg text-[11px] font-semibold text-center transition ${
                user.role === 'admin'
                  ? 'bg-red-600 text-white shadow ring-1 ring-red-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Admin Backoffice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
