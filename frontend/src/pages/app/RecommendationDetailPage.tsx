import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { recommendationService } from '@/services/recommendation-service';
import { portfolioService } from '@/services/portfolio-service';
import { marketService } from '@/services/market-service';
import type { MarketRegimeView, PortfolioResponse, RecommendationResponse } from '@/types/api';
import {
  formatDate,
  formatPercent,
  formatVND,
  getRecommendationStatusMeta,
  getRecommendationTypeLabel,
  getRiskAppetiteLabel,
} from '@/utils/formatters';
import { DonutChart } from '@/components/common/DonutChart';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import { LiveDemoPageHeader } from '@/components/common/LiveDemoPageHeader';
import { DisclaimerModal } from '@/components/common/DisclaimerModal';
import { ConfirmActionModal } from '@/components/common/ConfirmActionModal';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react';

export const RecommendationDetailPage: React.FC = () => {
  const { recommendationId } = useParams<{ recommendationId: string }>();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioResponse | null>(null);
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refreshAuthState } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!recommendationId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [recData, pData, regimeData] = await Promise.all([
        recommendationService.get(recommendationId),
        portfolioService.getCurrent().catch(() => null),
        marketService.getCurrentRegime().catch(() => null),
      ]);

      setRecommendation(recData);
      setCurrentPortfolio(pData);
      setCurrentRegime(regimeData);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải chi tiết đề xuất.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [recommendationId]);

  const handleConfirm = async () => {
    if (!recommendationId) return;
    try {
      setIsSubmitting(true);
      await recommendationService.confirm(recommendationId);
      await refreshAuthState();
      setIsDisclaimerOpen(false);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể xác nhận đề xuất.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!recommendationId) return;
    try {
      setIsSubmitting(true);
      await recommendationService.dismiss(recommendationId);
      await refreshAuthState();
      setIsDismissModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể bỏ qua đề xuất.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setIsSubmitting(true);
      const rec = await portfolioService.recalculate();
      navigate(`/app/recommendations/${rec.id}`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể tính lại danh mục.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (errorMessage || !recommendation) {
    return <ErrorState title="Lỗi tải đề xuất" message={errorMessage || 'Không tìm thấy dữ liệu đề xuất.'} onRetry={loadData} />;
  }

  const statusMeta = getRecommendationStatusMeta(recommendation.status);

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
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to="/app/recommendations"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Danh sách Đề xuất</span>
      </Link>

      <LiveDemoPageHeader
        title={getRecommendationTypeLabel(recommendation.type)}
        description={`Khởi tạo ngày ${formatDate(recommendation.generatedAt)} • Hết hạn ${formatDate(recommendation.expiresAt)}. Kiểm tra tín hiệu và thay đổi tỷ trọng trước khi xác nhận.`}
        regime={currentRegime}
        actions={
          <>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusMeta.bg}`}>
            {statusMeta.label}
          </span>
          {recommendation.status === 'GENERATED' && (
            <>
              <button
                onClick={() => setIsDismissModalOpen(true)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
              >
                <X className="w-4 h-4" />
                <span>Bỏ qua</span>
              </button>

              <button
                onClick={() => setIsDisclaimerOpen(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận danh mục</span>
              </button>
            </>
          )}

          {recommendation.status === 'EXPIRED' && (
            <button
              onClick={handleRecalculate}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tính lại danh mục mới</span>
            </button>
          )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">Vốn phân bổ</div>
          <div className="text-xl font-black text-slate-900">{formatVND(recommendation.capital)}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">Chế độ thị trường</div>
          <div className="pt-0.5">
            <MarketRegimeBadge code={recommendation.regime} size="sm" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">Khẩu vị rủi ro</div>
          <div className="text-sm font-extrabold text-blue-600">
            {getRiskAppetiteLabel(recommendation.riskAppetite)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">Phiên bản Mô hình AI</div>
          <div className="text-sm font-extrabold text-slate-900">
            {recommendation.portfolioModelVersion}
          </div>
        </div>
      </div>

      {recommendation.type === 'REBALANCE' && currentPortfolio && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            So sánh Thay đổi Tỷ trọng (Rebalance Comparison)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Mã CK</th>
                  <th className="py-3 px-4 text-right">Tỷ trọng hiện tại</th>
                  <th className="py-3 px-4 text-right">Tỷ trọng đề xuất</th>
                  <th className="py-3 px-4 text-right">Biến động (Chênh lệch)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recommendation.allocations.map((alloc) => {
                  const currAlloc = currentPortfolio.version.allocations.find((a) => a.symbol === alloc.symbol);
                  const oldW = currAlloc ? (typeof currAlloc.weight === 'string' ? parseFloat(currAlloc.weight) : currAlloc.weight) : 0;
                  const newW = typeof alloc.weight === 'string' ? parseFloat(alloc.weight) : alloc.weight;
                  const diff = newW - oldW;

                  return (
                    <tr key={alloc.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-blue-600">{alloc.symbol}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 text-right">
                        {formatPercent(oldW)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                        {formatPercent(newW)}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-black text-right ${
                          diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {formatPercent(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Tỷ trọng Phân bổ
          </h3>
          <DonutChart items={chartItems} centerLabel={formatVND(recommendation.capital)} centerSublabel="Vốn" />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Chi tiết Mã CK Đề xuất</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Mã CK</th>
                  <th className="py-3 px-4">Tên công ty</th>
                  <th className="py-3 px-4 text-right">Tỷ trọng</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-right">Giá tham chiếu</th>
                  <th className="py-3 px-4 text-right">Khối lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recommendation.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-blue-600">{alloc.symbol}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{alloc.companyName}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
        disclaimerText={recommendation.disclaimer}
      />

      <ConfirmActionModal
        isOpen={isDismissModalOpen}
        title="Bỏ qua đề xuất này?"
        message="Bạn có chắc muốn bỏ qua đề xuất này? Danh mục hiện tại sẽ được giữ nguyên."
        confirmText="Đồng ý bỏ qua"
        type="warning"
        isSubmitting={isSubmitting}
        onClose={() => setIsDismissModalOpen(false)}
        onConfirm={handleDismiss}
      />
    </div>
  );
};
