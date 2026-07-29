import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user-service';
import { profileService } from '@/services/profile-service';
import { authService } from '@/services/auth-service';
import type { InvestmentHorizon, RiskAppetite, UserPreferenceRead } from '@/types/api';
import {
  Bell,
  CheckCircle2,
  Info,
  Lock,
  LogOut,
  Save,
  User,
  Wallet,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshAuthState, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'investment' | 'notifications' | 'security'>('profile');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  const [capitalInput, setCapitalInput] = useState(profile?.capital ? profile.capital.toString() : '50000000');
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>(profile?.riskAppetite || 'MEDIUM');
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>(profile?.investmentHorizon || 'MEDIUM_TERM');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
    if (profile) {
      setCapitalInput(profile.capital ? profile.capital.toString() : '50000000');
      setRiskAppetite(profile.riskAppetite || 'MEDIUM');
      setInvestmentHorizon(profile.investmentHorizon || 'MEDIUM_TERM');
    }
    userService.getPreferences().then((pref: UserPreferenceRead) => {
      setEmailNotifs(pref.emailNotifications);
      setInAppNotifs(pref.inAppNotifications);
    }).catch(() => {});
  }, [user, profile]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await userService.updateMe({ fullName, email });
      await refreshAuthState();
      showSuccess('Cập nhật thông tin cá nhân thành công!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể cập nhật thông tin cá nhân.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvestmentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(capitalInput.replace(/[^0-9]/g, '')) || 0;
    if (cap < 1000000) {
      setErrorMessage('Vốn tối thiểu 1.000.000 VND.');
      return;
    }

    try {
      setIsSubmitting(true);
      await profileService.update({
        capital: cap,
        riskAppetite,
        investmentHorizon,
      });
      await refreshAuthState();
      showSuccess('Cập nhật hồ sơ đầu tư thành công!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể cập nhật hồ sơ đầu tư.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await userService.updatePreferences({
        emailNotifications: emailNotifs,
        inAppNotifications: inAppNotifs,
      });
      showSuccess('Cập nhật cài đặt thông báo thành công!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể cập nhật tùy chọn thông báo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showSuccess('Đổi mật khẩu thành công! Các phiên đăng nhập khác đã được thu hồi.');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Đổi mật khẩu thất bại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Cài đặt Tài khoản</h2>
        <p className="text-xs text-slate-500 font-medium">
          Quản lý thông tin cá nhân, hồ sơ đầu tư và thiết lập bảo mật
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { key: 'profile', label: 'Hồ sơ cá nhân', icon: User },
          { key: 'investment', label: 'Hồ sơ đầu tư', icon: Wallet },
          { key: 'notifications', label: 'Thông báo', icon: Bell },
          { key: 'security', label: 'Bảo mật & Mật khẩu', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Thông tin Cá nhân
          </h3>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'investment' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Cấu hình Hồ sơ Đầu tư
          </h3>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Thông báo:</strong> Thay đổi hồ sơ không tự động thay đổi danh mục hiện tại. Bạn cần thực hiện tính lại danh mục để nhận đề xuất tối ưu mới.
            </div>
          </div>

          <form onSubmit={handleUpdateInvestmentProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Vốn đầu tư ban đầu (VND)</label>
              <input
                type="text"
                required
                value={parseFloat(capitalInput.replace(/[^0-9]/g, '') || '0').toLocaleString('vi-VN')}
                onChange={(e) => setCapitalInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Khẩu vị rủi ro</label>
              <select
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value as RiskAppetite)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="LOW">Thận trọng (Low)</option>
                <option value="MEDIUM">Cân bằng (Medium)</option>
                <option value="HIGH">Tăng trưởng (High)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Thời gian đầu tư</label>
              <select
                value={investmentHorizon}
                onChange={(e) => setInvestmentHorizon(e.target.value as InvestmentHorizon)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="SHORT_TERM">Ngắn hạn (1-3 năm)</option>
                <option value="MEDIUM_TERM">Trung hạn (3-5 năm)</option>
                <option value="LONG_TERM">Dài hạn (5+ năm)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Cập nhật hồ sơ</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Kênh nhận Thông báo
          </h3>

          <form onSubmit={handleUpdatePreferences} className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-extrabold text-sm text-slate-900">Thông báo qua Email</div>
                <div className="text-xs text-slate-500">Nhận cảnh báo rebalance danh mục qua Email</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-extrabold text-sm text-slate-900">Thông báo In-App</div>
                <div className="text-xs text-slate-500">Hiển thị thông báo trên giao diện ứng dụng</div>
              </div>
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => setInAppNotifs(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Lưu tùy chọn</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Bảo mật & Đổi Mật khẩu
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự (chữ & số)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>Đổi mật khẩu</span>
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => logout()}
              className="px-6 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất khỏi tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
