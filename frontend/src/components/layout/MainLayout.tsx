import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { marketService } from '@/services/market-service';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import type { MarketRegimeView } from '@/types/api';
import { formatDate } from '@/utils/formatters';
import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout, unreadCount } = useAuth();
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    marketService
      .getCurrentRegime()
      .then((data) => setCurrentRegime(data))
      .catch((err) => console.error('Failed to fetch market regime:', err));
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio', path: '/app/portfolio', icon: PieChart },
    { label: 'Thị trường', path: '/app/market', icon: TrendingUp },
    { label: 'Đề xuất AI', path: '/app/recommendations', icon: Sparkles },
    { label: 'Thông báo', path: '/app/notifications', icon: Bell, badge: unreadCount },
    { label: 'Lịch sử', path: '/app/history', icon: Clock },
    { label: 'Cài đặt', path: '/app/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Tổng quan Danh mục';
    if (path.includes('/portfolio/version')) return 'Chi tiết Phiên bản Danh mục';
    if (path.includes('/portfolio')) return 'Danh mục Đầu tư';
    if (path.includes('/market')) return 'Chế độ Thị trường (Market Regime)';
    if (path.includes('/stocks/')) return 'Thông tin Cổ phiếu';
    if (path.includes('/recommendations/')) return 'Chi tiết Đề xuất';
    if (path.includes('/recommendations')) return 'Danh sách Đề xuất AI';
    if (path.includes('/notifications')) return 'Trung tâm Thông báo';
    if (path.includes('/history')) return 'Lịch sử Hoạt động';
    if (path.includes('/settings')) return 'Cài đặt Tài khoản';
    return 'Wealth4ward Advisor';
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-bright flex text-slate-900 font-sans">
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 z-30 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Wealth4ward
              </span>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      sidebarCollapsed
                        ? 'absolute top-1 right-1 w-2.5 h-2.5 p-0 bg-rose-500 rounded-full'
                        : 'ml-auto bg-rose-500 text-white'
                    }`}
                  >
                    {!sidebarCollapsed && (item.badge > 99 ? '99+' : item.badge)}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-slate-900 truncate">
                  {user?.fullName || 'Người dùng Wealth4ward'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        />
      )}

      {mobileDrawerOpen && (
        <aside className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Wealth4ward
              </span>
            </Link>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="min-h-20 bg-white border-b border-slate-200/80 px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  AI Brain Engine Active
                </span>
                <span className="text-slate-300">•</span>
                <span>Wealth4ward investment console</span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 truncate md:text-lg">
                {getPageTitle()}
              </h1>
              <p className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                Dữ liệu thị trường: {formatDate(currentRegime?.dataDate || currentRegime?.detectedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div className="hidden lg:block text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Market regime</div>
                <div className="text-[11px] font-black text-slate-700">{currentRegime?.modelVersion || 'HMM Core'}</div>
              </div>
              <MarketRegimeBadge code={currentRegime?.code || 'UNKNOWN'} size="sm" />
            </div>

            <button
              onClick={() => navigate('/app/notifications')}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      {user?.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>

                  <Link
                    to="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Cài đặt hệ thống</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
