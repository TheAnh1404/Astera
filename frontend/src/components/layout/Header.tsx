import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenAssessment?: () => void;
  onOpenLiveDemo: () => void;
  onOpenPortfolio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAssessment, onOpenLiveDemo, onOpenPortfolio }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartFree = () => {
    if (onOpenAssessment) {
      onOpenAssessment();
    } else {
      navigate('/register');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm py-3'
          : 'bg-white/70 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            ASTERA
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <a href="#risk" onClick={() => { onOpenPortfolio?.(); }} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Danh mục đầu tư 
          </a>
          <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Cách hoạt động
          </a>
          <a href="#why-astera" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Vì sao Astera
          </a>
          <a href="#learn" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Học đầu tư
          </a>
          <a href="#about" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Về chúng tôi
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenLiveDemo}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-full transition-all shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>Demo AI Live Core</span>
          </button>

          {user ? (
            <Link
              to="/app/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Vào Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-blue-600 px-4 py-2.5 rounded-full transition-colors"
              >
                Đăng nhập
              </Link>
              <button
                onClick={handleStartFree}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Bắt đầu miễn phí
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-semibold text-slate-700">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Sản phẩm</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Cách hoạt động</a>
            <a href="#why-astera" onClick={() => setMobileMenuOpen(false)}>Vì sao Astera</a>
            <a href="#learn" onClick={() => setMobileMenuOpen(false)}>Học đầu tư</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>Về chúng tôi</a>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {user ? (
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-blue-600 text-white py-3 rounded-full font-bold shadow-md"
              >
                Vào Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-semibold text-slate-700 border border-slate-200 rounded-full"
                >
                  Đăng nhập
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleStartFree();
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-full font-bold shadow-md text-center"
                >
                  Bắt đầu miễn phí
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
