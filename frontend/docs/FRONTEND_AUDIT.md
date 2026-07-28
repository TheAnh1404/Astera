# Astera Frontend Audit Document

## 1. Existing Stack
- **Framework**: React 19.2.7 + TypeScript 6.0.2
- **Build Tool**: Vite 8.1.1 + @vitejs/plugin-react
- **Styling**: TailwindCSS 4.3.3 + @tailwindcss/vite + Vanilla CSS utilities in `src/styles/global.css`
- **Routing**: React Router DOM 7.18.1 (`BrowserRouter`, `Routes`, `Route`)
- **Icons**: Lucide React 1.26.0
- **Animations / Micro-interactions**: Framer Motion 12.42.2 + Canvas Confetti 1.9.4
- **Utilities**: `clsx`, `tailwind-merge`
- **Linter**: Oxlint 1.71.0
- **Import Alias**: `@` -> `src/`

## 2. Existing Routes
- `/` -> Landing Page with Header, Hero, Sections, Footer, AssessmentModal
- `/live-demo` -> AI Quantum Live Core Demo
- `/portfolio` -> Public Portfolio History Demo

## 3. Existing Pages & Features
- `LandingPage`: Modular section composition (`HeroSection`, `TrustBannerSection`, `InvestorProblemsSection`, `HowItWorksSection`, `DashboardPreviewSection`, `FullExperienceSection`, `PartnerMarquee`, `FinalCtaBanner`).
- `LiveDemoPage`: Self-contained interactive simulator page.
- `PublicPortfolioPage`: Interactive public portfolio demonstration.
- `AssessmentModal`: Interactive step-by-step risk & goal survey.

## 4. Existing Design System & Branding Tokens
- **Primary**: Slate 900 (`#0f172a`), Dark Navy (`#131b2e`)
- **Secondary Accent**: Blue 600 (`#2563eb`), Secondary (`#0051d5`), Container (`#316bf3`)
- **Tertiary Accent / Growth**: Emerald 600 (`#059669`), Mint (`#6ffbbe`, `#009668`)
- **Background**: White (`#ffffff`), Surface Light (`#f7f9fb`), Surface Container (`#eceef0`)
- **Text Primary**: Slate 900 (`#0f172a`), On Surface (`#191c1e`)
- **Text Secondary**: Slate 600 (`#475569`), On Surface Variant (`#45464d`)
- **Border**: Slate 200 (`#e2e8f0`), Outline (`#76777d`), Outline Variant (`#c6c6cd`)
- **Border Radius**: Default (`0.25rem`), LG (`0.5rem`), XL (`0.75rem`), Premium (`24px`), 2XL (`16px`), 3XL (`24px`), Full (`9999px`)
- **Shadows**: Soft subtle shadows (`shadow-sm`, `shadow-md`, `shadow-xl`, `glass-card`)
- **Typography**: Inter / Sans-serif (`font-sans`)

## 5. Mock Data Audit
- Mock data in `LiveDemoPage.tsx`, `PublicPortfolioPage.tsx`, `AssessmentModal.tsx`.
- Real production flow will fetch live data from Astera FastAPI backend (`http://localhost:8000/api/v1`).

## 6. API Integration Gaps to Fill
- Auth client & Token storage with refresh token queue (`/api/v1/auth/*`)
- Current user & Onboarding status checks (`/api/v1/auth/me`, `/api/v1/investment-profile`)
- Onboarding Profile creation (`POST /api/v1/investment-profile`)
- Recommendation generation (`POST /api/v1/recommendations`)
- Recommendation confirmation & Portfolio creation (`POST /api/v1/recommendations/:id/confirm`)
- Dashboard real-time metrics (`GET /api/v1/portfolios/current`, `GET /api/v1/portfolios/current/performance`)
- Portfolio & Version detail management (`GET /api/v1/portfolios/current/versions`)
- Market Regime monitoring (`GET /api/v1/market/regime/current`, `GET /api/v1/market/regimes`)
- Stock catalog & detail view (`GET /api/v1/stocks`, `GET /api/v1/stocks/:symbol`, `GET /api/v1/stocks/:symbol/history`)
- Notifications & Rebalance Action execution (`GET/PATCH/POST /api/v1/notifications/*`)
- Audit History timeline (`GET /api/v1/history`)
- User Profile & Preferences Settings (`GET/PATCH /api/v1/users/me`, `GET/PATCH /api/v1/users/me/preferences`)

## 7. Reused vs Created Pages & Components
- **Reused**: Landing Page & sections intact, Header, Footer, Assessment Modal.
- **Created**:
  - Auth Pages: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`
  - Onboarding Pages: `InvestmentProfilePage`, `AnalyzingPage`, `OnboardingRecommendationPage`
  - App Pages: `DashboardPage`, `PortfolioPage`, `PortfolioVersionDetailPage`, `MarketPage`, `StockDetailPage`, `RecommendationsPage`, `RecommendationDetailPage`, `NotificationsPage`, `HistoryPage`, `SettingsPage`
  - System Pages: `NotFoundPage`, `ServerErrorPage`
  - Components: `MainLayout`, `Sidebar`, `AppHeader`, `MarketRegimeBadge`, `DonutChart`, `PerformanceChart`, `StockChart`, `HoldingsTable`, `RebalanceComparisonModal`, `DisclaimerModal`, `ConfirmActionModal`, `LoadingSkeleton`, `EmptyState`, `ErrorState`, `CurrencyText`, `PercentageText`.
