import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC<{ title?: string }> = ({ title = 'Đang tải dữ liệu Astera...' }) => (
  <div className="min-h-screen w-full bg-surface-bright flex flex-col items-center justify-center p-6">
    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 animate-bounce">
        <Sparkles className="w-7 h-7 fill-white" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
    </div>
  </div>
);

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, onboardingStep, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen title="Đang kiểm tra phiên làm việc..." />;
  }

  if (user) {
    // Already authenticated -> redirect based on onboarding step
    if (onboardingStep === 'NEED_PROFILE') {
      return <Navigate to="/onboarding/profile" replace />;
    }
    if (onboardingStep === 'NEED_RECOMMENDATION') {
      return <Navigate to="/onboarding/analyzing" replace />;
    }
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen title="Đang xác thực thông tin..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, onboardingStep, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen title="Đang xác định trạng thái hồ sơ..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle onboarding state enforcement
  if (onboardingStep === 'NEED_PROFILE' && location.pathname !== '/onboarding/profile') {
    return <Navigate to="/onboarding/profile" replace />;
  }

  if (
    onboardingStep === 'NEED_RECOMMENDATION' &&
    !location.pathname.startsWith('/onboarding/analyzing') &&
    !location.pathname.startsWith('/onboarding/recommendation')
  ) {
    return <Navigate to="/onboarding/analyzing" replace />;
  }

  if (
    onboardingStep === 'COMPLETED' &&
    (location.pathname === '/onboarding/profile' || location.pathname === '/onboarding/analyzing')
  ) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
