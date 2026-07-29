import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredAccessToken, clearTokens } from '@/services/api-client';
import { authService } from '@/services/auth-service';
import { profileService } from '@/services/profile-service';
import { portfolioService } from '@/services/portfolio-service';
import { notificationService } from '@/services/notification-service';
import type { InvestmentProfileRead, PortfolioResponse, UserRead } from '@/types/api';

export type OnboardingStep = 'CHECKING' | 'UNAUTHENTICATED' | 'NEED_PROFILE' | 'NEED_RECOMMENDATION' | 'COMPLETED';

interface AuthContextType {
  user: UserRead | null;
  profile: InvestmentProfileRead | null;
  portfolio: PortfolioResponse | null;
  onboardingStep: OnboardingStep;
  isLoading: boolean;
  unreadCount: number;
  login: (tokenData: { user: UserRead }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [profile, setProfile] = useState<InvestmentProfileRead | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('CHECKING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const res = await notificationService.list(1, 50, 'UNREAD');
      setUnreadCount(res.total || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const refreshAuthState = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setPortfolio(null);
      setOnboardingStep('UNAUTHENTICATED');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const meData = await authService.getMe();
      setUser(meData);

      const activeProfile = await profileService.getActive();
      setProfile(activeProfile);

      if (!activeProfile) {
        setPortfolio(null);
        setOnboardingStep('NEED_PROFILE');
      } else {
        const currentPortfolio = await portfolioService.getCurrent();
        setPortfolio(currentPortfolio);

        if (!currentPortfolio) {
          setOnboardingStep('NEED_RECOMMENDATION');
        } else {
          setOnboardingStep('COMPLETED');
        }
      }

      fetchUnreadNotifications().catch(() => {});
    } catch (err) {
      console.error('Failed to restore auth state:', err);
      clearTokens();
      setUser(null);
      setProfile(null);
      setPortfolio(null);
      setOnboardingStep('UNAUTHENTICATED');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUnreadNotifications]);

  useEffect(() => {
    refreshAuthState();

    const handleUnauthorized = () => {
      clearTokens();
      setUser(null);
      setProfile(null);
      setPortfolio(null);
      setOnboardingStep('UNAUTHENTICATED');
    };

    window.addEventListener('wealth4ward:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('wealth4ward:unauthorized', handleUnauthorized);
  }, [refreshAuthState]);

  const login = async (_: { user: UserRead }) => {
    await refreshAuthState();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setPortfolio(null);
      setUnreadCount(0);
      setOnboardingStep('UNAUTHENTICATED');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        portfolio,
        onboardingStep,
        isLoading,
        unreadCount,
        login,
        logout,
        refreshAuthState,
        refreshNotifications: fetchUnreadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
