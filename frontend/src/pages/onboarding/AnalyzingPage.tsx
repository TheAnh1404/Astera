import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketService } from '@/services/market-service';
import { recommendationService } from '@/services/recommendation-service';
import { getFriendlyErrorMessage } from '@/services/api-client';
import { AlertCircle, CheckCircle2, RefreshCw, Sparkles, UserCheck } from 'lucide-react';

export const AnalyzingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);

  const navigate = useNavigate();

  const steps = [
    'Đang đọc hồ sơ đầu tư của bạn',
    'Đang cập nhật dữ liệu thị trường mới nhất',
    'Đang xác định chế độ thị trường (Market Regime HMM)',
    'Đang tối ưu hóa tỷ trọng danh mục tư vấn AI',
  ];

  const runAnalysis = async () => {
    setIsFailed(false);
    setErrorMessage(null);
    setActiveStep(1);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      // The backend lazily synchronizes the read-only HMM artifact when no
      // current regime exists. Do this before generating the first portfolio
      // recommendation so a fresh database can complete onboarding.
      await marketService.getCurrentRegime();
      const rec = await recommendationService.generate('INITIAL');
      clearInterval(stepInterval);
      setActiveStep(4);
      setTimeout(() => {
        navigate(`/onboarding/recommendation/${rec.id}`);
      }, 800);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsFailed(true);
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const code = (err as { code: string }).code;
        const msg = (err as { message?: string }).message || getFriendlyErrorMessage(code, 500);
        setErrorMessage(msg);
      } else {
        setErrorMessage('Không thể khởi tạo danh mục đầu tư. Vui lòng thử lại.');
      }
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-8 animate-in fade-in duration-300">
        {!isFailed ? (
          <>
            {/* Animated Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-blue-600/20 animate-ping" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Sparkles className="w-10 h-10 fill-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                AI Wealth4ward đang phân tích & xây dựng danh mục
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Vui lòng đợi trong giây lát, hệ thống đang chạy mô hình tối ưu hóa tài sản...
              </p>
            </div>

            {/* Step Progress List */}
            <div className="space-y-3 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
              {steps.map((text, idx) => {
                const stepNum = idx + 1;
                const isDone = activeStep > stepNum;
                const isCurrent = activeStep === stepNum;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    {isDone ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 animate-spin">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {stepNum}
                      </div>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        isDone
                          ? 'text-slate-800'
                          : isCurrent
                          ? 'text-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Error State */
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Không thể khởi tạo danh mục tư vấn
              </h3>
              <p className="text-xs text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-200 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/onboarding/profile')}
                className="w-full py-3 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Chỉnh sửa Hồ sơ</span>
              </button>

              <button
                onClick={runAnalysis}
                className="w-full btn-primary text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
