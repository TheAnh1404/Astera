import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profile-service';
import type { InvestmentHorizon, RiskAppetite } from '@/types/api';
import { formatVND } from '@/utils/formatters';
import { ArrowRight, Check, ShieldCheck, Sparkles, TrendingUp, Wallet } from 'lucide-react';

export const InvestmentProfilePage: React.FC = () => {
  const { profile, refreshAuthState } = useAuth();
  const navigate = useNavigate();

  const [capitalInput, setCapitalInput] = useState<string>('50000000');
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>('MEDIUM');
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>('MEDIUM_TERM');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setCapitalInput(profile.capital ? profile.capital.toString() : '50000000');
      setRiskAppetite(profile.riskAppetite || 'MEDIUM');
      setInvestmentHorizon(profile.investmentHorizon || 'MEDIUM_TERM');
    }
  }, [profile]);

  const getProfileDefaults = (risk: RiskAppetite) => {
    switch (risk) {
      case 'LOW':
        return { expectedReturn: 0.08, maximumDrawdown: 0.1 };
      case 'HIGH':
        return { expectedReturn: 0.22, maximumDrawdown: 0.25 };
      default:
        return { expectedReturn: 0.14, maximumDrawdown: 0.18 };
    }
  };

  const parsedCapital = parseFloat(capitalInput.replace(/[^0-9]/g, '')) || 0;

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCapitalInput(rawVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (parsedCapital < 1000000) {
      setErrorMessage('Số vốn đầu tư tối thiểu là 1.000.000 VND.');
      return;
    }

    const { expectedReturn, maximumDrawdown } = getProfileDefaults(riskAppetite);

    try {
      setIsSubmitting(true);
      if (profile) {
        await profileService.update({
          capital: parsedCapital,
          riskAppetite,
          investmentHorizon,
          expectedReturn,
          maximumDrawdown,
        });
      } else {
        await profileService.create({
          capital: parsedCapital,
          riskAppetite,
          investmentHorizon,
          expectedReturn,
          maximumDrawdown,
        });
      }

      await refreshAuthState();
      navigate('/onboarding/analyzing');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể lưu hồ sơ đầu tư. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 1: Thiết lập Hồ sơ Đầu tư</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Khảo sát Mục tiêu & Khẩu vị Rủi ro</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Hệ thống AI Wealth4ward cần thông tin hồ sơ để xác định chiến lược phân bổ tài sản phù hợp nhất với bạn.
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-8">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Số vốn đầu tư ban đầu (VND)</span>
                </span>
                <span className="text-xs text-blue-600 font-bold">Tối thiểu: 1.000.000 ₫</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={parsedCapital > 0 ? parsedCapital.toLocaleString('vi-VN') : ''}
                  onChange={handleCapitalChange}
                  placeholder="50.000.000"
                  className="w-full pl-4 pr-16 py-4 rounded-2xl border-2 border-slate-200 text-xl font-black text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                  VND
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Số tiền nhập: {formatVND(parsedCapital)}</span>
                <div className="flex gap-2">
                  {[10000000, 50000000, 100000000, 500000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCapitalInput(val.toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      {(val / 1000000).toLocaleString()} triệu
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Khẩu vị rủi ro</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    key: 'LOW' as RiskAppetite,
                    title: 'Thận trọng',
                    subtitle: 'Bảo toàn vốn',
                    desc: 'Ưu tiên biến động thấp, lợi nhuận kỳ vọng 8%/năm, sụt giảm tối đa 10%.',
                  },
                  {
                    key: 'MEDIUM' as RiskAppetite,
                    title: 'Cân bằng',
                    subtitle: 'Tăng trưởng ổn định',
                    desc: 'Cân bằng giữa tăng trưởng & rủi ro, lợi nhuận kỳ vọng 14%/năm, sụt giảm 18%.',
                  },
                  {
                    key: 'HIGH' as RiskAppetite,
                    title: 'Tăng trưởng',
                    subtitle: 'Tối đa lợi nhuận',
                    desc: 'Chấp nhận biến động cao để tối ưu lợi nhuận 22%/năm dài hạn.',
                  },
                ].map((option) => (
                  <div
                    key={option.key}
                    onClick={() => setRiskAppetite(option.key)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      riskAppetite === option.key
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{option.title}</span>
                      {riskAppetite === option.key && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-blue-600">{option.subtitle}</div>
                    <p className="text-[11px] text-slate-500 leading-snug">{option.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Thời gian đầu tư dự kiến</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: 'SHORT_TERM' as InvestmentHorizon, title: 'Ngắn hạn', desc: '1 đến 3 năm' },
                  { key: 'MEDIUM_TERM' as InvestmentHorizon, title: 'Trung hạn', desc: '3 đến 5 năm' },
                  { key: 'LONG_TERM' as InvestmentHorizon, title: 'Dài hạn', desc: 'Trên 5 năm' },
                ].map((option) => (
                  <div
                    key={option.key}
                    onClick={() => setInvestmentHorizon(option.key)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      investmentHorizon === option.key
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{option.title}</div>
                      <div className="text-xs text-slate-500">{option.desc}</div>
                    </div>
                    {investmentHorizon === option.key && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || parsedCapital < 1000000}
                className="btn-primary text-white text-xs font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40"
              >
                {isSubmitting ? (
                  <span>Đang lưu hồ sơ...</span>
                ) : (
                  <>
                    <span>Tiếp tục Phân tích AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
