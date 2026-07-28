import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { GuestRoute, OnboardingGuard, ProtectedRoute } from '@/router/guards';

import { Footer, Header } from '@/components/layout';
import { MainLayout } from '@/components/layout/MainLayout';
import { AssessmentModal } from '@/features/assessment';

// Landing & Demos
import { LandingPage } from '@/features/landing';
import { LiveDemoPage } from '@/features/live-demo';
import { PublicPortfolioPage } from '@/features/public-portfolio';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Onboarding Pages
import { InvestmentProfilePage } from '@/pages/onboarding/InvestmentProfilePage';
import { AnalyzingPage } from '@/pages/onboarding/AnalyzingPage';
import { OnboardingRecommendationPage } from '@/pages/onboarding/OnboardingRecommendationPage';

// App Pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { PortfolioPage } from '@/pages/app/PortfolioPage';
import { PortfolioVersionDetailPage } from '@/pages/app/PortfolioVersionDetailPage';
import { MarketPage } from '@/pages/app/MarketPage';
import { StockDetailPage } from '@/pages/app/StockDetailPage';
import { RecommendationsPage } from '@/pages/app/RecommendationsPage';
import { RecommendationDetailPage } from '@/pages/app/RecommendationDetailPage';
import { NotificationsPage } from '@/pages/app/NotificationsPage';
import { HistoryPage } from '@/pages/app/HistoryPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

// System Pages
import { NotFoundPage } from '@/pages/system/NotFoundPage';
import { ServerErrorPage } from '@/pages/system/ServerErrorPage';

export function App() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <>
                <Header
                  onOpenAssessment={() => navigate('/register')}
                  onOpenLiveDemo={() => navigate('/live-demo')}
                  onOpenPortfolio={() => navigate('/portfolio')}
                />
                <LandingPage
                  onOpenAssessment={() => navigate('/register')}
                  onOpenLiveDemo={() => navigate('/live-demo')}
                />
                <Footer />
                <AssessmentModal
                  isOpen={isAssessmentOpen}
                  onClose={() => setIsAssessmentOpen(false)}
                />
              </>
            }
          />

          {/* Public Simulator Demos */}
          <Route path="/live-demo" element={<LiveDemoPage />} />
          <Route path="/portfolio" element={<PublicPortfolioPage />} />

          {/* Guest Auth Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            }
          />

          {/* Onboarding Flow Routes */}
          <Route
            path="/onboarding/profile"
            element={
              <OnboardingGuard>
                <InvestmentProfilePage />
              </OnboardingGuard>
            }
          />
          <Route
            path="/onboarding/analyzing"
            element={
              <OnboardingGuard>
                <AnalyzingPage />
              </OnboardingGuard>
            }
          />
          <Route
            path="/onboarding/recommendation/:recommendationId"
            element={
              <OnboardingGuard>
                <OnboardingRecommendationPage />
              </OnboardingGuard>
            }
          />

          {/* Protected Main App Layout & Pages */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <MainLayout />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="portfolio/version/:versionId" element={<PortfolioVersionDetailPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="recommendations/:recommendationId" element={<RecommendationDetailPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="stocks/:symbol" element={<StockDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* System Error & 404 Pages */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
