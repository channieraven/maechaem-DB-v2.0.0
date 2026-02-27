import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireApproved?: boolean;
}

const SLOW_THRESHOLD_MS = 3_000;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApproved = true,
}) => {
  const { user, profile, isLoading, initError, initTimedOut, retryInit } = useAuth();
  const location = useLocation();
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), SLOW_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#2d5a27] mx-auto" />
          <p className="mt-4 text-sm text-gray-500">
            {isSlow
              ? 'กำลังเชื่อมต่อระบบ... กรุณารอสักครู่'
              : 'กำลังตรวจสอบสิทธิ์...'}
          </p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
            <WifiOff size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {initTimedOut ? 'การเชื่อมต่อหมดเวลา' : 'เชื่อมต่อไม่สำเร็จ'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{initError}</p>
          <button
            onClick={retryInit}
            className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#234820] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireApproved && !profile?.approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/plots" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
