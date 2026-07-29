import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { recommendationService } from '@/services/recommendation-service';
import { marketService } from '@/services/market-service';
import type { MarketRegimeView, RecommendationResponse } from '@/types/api';
import {
  formatDate,
  formatPercent,
  formatVND,
  getHorizonLabel,
  getRiskAppetiteLabel,
} from '@/utils/formatters';
import { DonutChart } from '@/components/common/DonutChart';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import { LiveDemoPageHeader } from '@/components/common/LiveDemoPageHeader';
import { DisclaimerModal } from '@/components/common/DisclaimerModal';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Check, Edit3, ShieldAlert } from 'lucide-react';

export const OnboardingRecommendationPage: React.FC = () => {
  const { recommendationId } = useParams<{ recommendationId: string }>();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { refreshAuthState } = useAuth();
  const navigate = useNavigate();

  const fetchRecommendation = async () => {
    if (!recommendationId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [res, regime] = await Promise.all([
        recommendationService.get(recommendationId),
        marketService.getCurrentRegime().catch(() => null),
      ]);
      setRecommendation(res);
      setCurrentRegime(regime);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải chi tiết đề xuất danh mục.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [recommendationId]);

  const handleConfirmPortfolio = async () => {
    if (!recommendationId) return;
    try {
      setIsConfirming(true);
      await recommendationService.confirm(recommendationId);
      await refreshAuthState();
      setIsDisclaimerOpen(false);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể xác nhận danh mục. Vui lòng thử lại.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-bright p-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-6">
          <LoadingSkeleton type="card" count={3} />
          <LoadingSkeleton type="table" count={5} />
        </div>
      </div>
    );
  }

  if (errorMessage || !recommendation) {
    return (
      <div className="min-h-screen bg-surface-bright p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorState
            title="Lỗi tải đề xuất"
            message={errorMessage || 'Không tìm thấy thông tin đề xuất danh mục.'}
            onRetry={fetchRecommendation}
          />
        </div>
      </div>
    );
  }

  const chartItems = [
    ...recommendation.allocations.map((alloc) => ({
      symbol: alloc.symbol,
      name: alloc.companyName,
      weight: typeof alloc.weight === 'string' ? parseFloat(alloc.weight) : alloc.weight,
      amount: alloc.amount,
    })),
    ...(parseFloat(recommendation.cashWeight.toString()) > 0
      ? [
          {
            symbol: 'TIỀN MẶT',
            name: 'Dự trữ phòng thủ',
            weight: parseFloat(recommendation.cashWeight.toString()),
            amount: recommendation.cashAmount,
            color: '#94a3b8',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-surface-bright p-4 md:p-8 flex flex-col items-center py-10">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-300">
        <LiveDemoPageHeader
          eyebrow="BƯỚC 2 • KẾT QUẢ ĐỀ XUẤT AI"
          title="Danh mục Tối ưu Khuyến nghị"
          description={`Khởi tạo ngày ${formatDate(recommendation.generatedAt)} • Hết hạn ${formatDate(recommendation.expiresAt)}. Kiểm tra tỷ trọng và lý do phân bổ trước khi khởi tạo danh mục.`}
          regime={currentRegime}
          actions={
            <>
            <button
              onClick={() => navigate('/onboarding/profile')}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <Edit3 className="w-4 h-4" />
              <span>Sửa hồ sơ</span>
            </button>

            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận danh mục</span>
            </button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Vốn khởi tạo</div>
            <div className="text-xl font-black text-slate-900">
              {formatVND(recommendation.capital)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Khẩu vị rủi ro</div>
            <div className="text-sm font-extrabold text-blue-600">
              {getRiskAppetiteLabel(recommendation.riskAppetite)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Thời gian đầu tư</div>
            <div className="text-sm font-extrabold text-slate-900">
              {getHorizonLabel(recommendation.investmentHorizon)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Chế độ thị trường</div>
            <div className="pt-0.5">
              <MarketRegimeBadge code={recommendation.regime} size="sm" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
          <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Tỷ trọng Phân bổ Tài sản
          </h3>

          <DonutChart
            items={chartItems}
            centerLabel={formatVND(recommendation.capital)}
            centerSublabel="Tổng Vốn"
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Chi tiết Danh mục Cổ phiếu</h3>
            <span className="text-xs font-bold text-slate-500">
              Số mã cổ phiếu: {recommendation.allocations.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Mã CK</th>
                  <th className="py-3 px-4">Tên công ty</th>
                  <th className="py-3 px-4 text-right">Tỷ trọng</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-right">Giá tham chiếu</th>
                  <th className="py-3 px-4 text-right">Khối lượng ước tính</th>
                  <th className="py-3 px-4">Lý do phân bổ AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recommendation.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-blue-600">{alloc.symbol}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[160px] truncate">
                      {alloc.companyName}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                      {formatPercent(alloc.weight)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-right">
                      {formatVND(alloc.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-right">
                      {formatVND(alloc.referencePrice)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right">
                      {typeof alloc.quantityEstimated === 'string'
                        ? parseInt(alloc.quantityEstimated, 10).toLocaleString('vi-VN')
                        : Math.round(alloc.quantityEstimated).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[220px] truncate">
                      {alloc.reason}
                    </td>
                  </tr>
                ))}

                {parseFloat(recommendation.cashAmount.toString()) > 0 && (
                  <tr className="bg-slate-50/80 font-bold">
                    <td className="py-3.5 px-4 text-slate-500">TIỀN MẶT</td>
                    <td className="py-3.5 px-4 text-slate-500">Dự trữ phòng thủ</td>
                    <td className="py-3.5 px-4 text-slate-900 text-right">
                      {formatPercent(recommendation.cashWeight)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 text-right">
                      {formatVND(recommendation.cashAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">-</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">-</td>
                    <td className="py-3.5 px-4 text-slate-500">Quản trị rủi ro tiền mặt</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý mô phỏng:</span> {recommendation.disclaimer}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="btn-primary text-white text-sm font-bold px-10 py-4 rounded-full flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Xác nhận & Khởi tạo Danh mục</span>
          </button>
        </div>

        <DisclaimerModal
          isOpen={isDisclaimerOpen}
          onClose={() => setIsDisclaimerOpen(false)}
          onConfirm={handleConfirmPortfolio}
          isSubmitting={isConfirming}
          disclaimerText={recommendation.disclaimer}
        />
      </div>
    </div>
  );
};
