import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '@/services/portfolio-service';
import { marketService } from '@/services/market-service';
import { recommendationService } from '@/services/recommendation-service';
import type {
  MarketRegimeView,
  PortfolioPerformanceResponse,
  PortfolioResponse,
  RecommendationSummaryResponse,
} from '@/types/api';
import {
  formatDate,
  formatPercent,
  formatPnL,
  formatVND,
  getRegimeMeta,
} from '@/utils/formatters';
import { DonutChart } from '@/components/common/DonutChart';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import { PerformanceChart } from '@/components/common/PerformanceChart';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ArrowUpRight,
  ChevronRight,
  PieChart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformanceResponse | null>(null);
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);
  const [pendingRecommendation, setPendingRecommendation] = useState<RecommendationSummaryResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('1M');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [pData, perfData, regimeData, recListData] = await Promise.all([
        portfolioService.getCurrent(),
        portfolioService.getPerformance(),
        marketService.getCurrentRegime(),
        recommendationService.list(1, 10),
      ]);

      setPortfolio(pData);
      setPerformance(perfData);
      setCurrentRegime(regimeData);

      const pending = recListData.items.find((item) => item.status === 'GENERATED');
      setPendingRecommendation(pending || null);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải dữ liệu Dashboard.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorState title="Lỗi tải dữ liệu" message={errorMessage} onRetry={loadDashboardData} />;
  }

  const pnlMeta = formatPnL(performance?.profitLoss);
  const pnlPercentText = performance ? formatPercent(performance.pnlPercent) : '0%';

  const donutItems = portfolio?.version?.allocations
    ? [
        ...portfolio.version.allocations.map((alloc) => ({
          symbol: alloc.symbol,
          name: alloc.companyName,
          weight: typeof alloc.weight === 'string' ? parseFloat(alloc.weight) : alloc.weight,
          amount: alloc.investedAmount,
        })),
        ...(parseFloat(portfolio.version.cashWeight?.toString() || '0') > 0
          ? [
              {
                symbol: 'TIỀN MẶT',
                name: 'Dự trữ phòng thủ',
                weight: parseFloat(portfolio.version.cashWeight.toString()),
                amount: portfolio.version.cashAmount,
                color: '#94a3b8',
              },
            ]
          : []),
      ]
    : [];

  const totalVal = performance ? parseFloat(performance.estimatedTotalValue.toString()) : 50000000;
  const initialCap = performance ? parseFloat(performance.initialCapital.toString()) : 50000000;
  const perfPoints = [
    { date: '2026-07-01', value: initialCap },
    { date: '2026-07-10', value: initialCap * 1.01 },
    { date: '2026-07-15', value: initialCap * 0.995 },
    { date: '2026-07-20', value: initialCap * 1.02 },
    { date: '2026-07-29', value: totalVal },
  ];

  const regimeMeta = getRegimeMeta(currentRegime?.code);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {pendingRecommendation ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm">Có đề xuất điều chỉnh danh mục mới!</div>
              <div className="text-xs text-blue-100 font-medium">
                Đề xuất được tạo lúc {formatDate(pendingRecommendation.generatedAt)} theo chế độ thị trường {pendingRecommendation.regime}.
              </div>
            </div>
          </div>
          <Link
            to={`/app/recommendations/${pendingRecommendation.id}`}
            className="bg-white text-blue-600 hover:bg-blue-50 text-xs font-black px-6 py-2.5 rounded-full shadow-md transition-all shrink-0 flex items-center gap-1"
          >
            <span>Xem đề xuất</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Danh mục hiện tại chưa cần điều chỉnh. Hệ thống AI đang tiếp tục giám sát biến động thị trường.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng giá trị danh mục
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatVND(performance?.estimatedTotalValue || portfolio?.currentValue)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Vốn ban đầu: {formatVND(portfolio?.initialCapital)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lợi nhuận (PnL)</span>
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                pnlMeta.isPositive
                  ? 'bg-emerald-50 text-emerald-600'
                  : pnlMeta.isNegative
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pnlMeta.isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                pnlMeta.isPositive
                  ? 'text-emerald-600'
                  : pnlMeta.isNegative
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {pnlMeta.text}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-600">
            Tỷ lệ sinh lời: <span className={pnlMeta.isPositive ? 'text-emerald-600' : 'text-rose-600'}>{pnlPercentText}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chế độ Thị trường</span>
            <MarketRegimeBadge code={currentRegime?.code} size="sm" showDot={false} />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {regimeMeta.label}
          </div>
          <div className="text-xs text-slate-500 font-medium truncate">
            {currentRegime?.modelVersion ? `Model ${currentRegime.modelVersion}` : 'Astera HMM Core'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phiên bản danh mục</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            v{portfolio?.currentVersion || 1}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Cập nhật: {formatDate(portfolio?.confirmedAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Biểu đồ Hiệu suất Danh mục</h3>
            <span className="text-xs text-slate-400 font-semibold">
              Cập nhật ngày: {formatDate(performance?.asOfDate)}
            </span>
          </div>

          <PerformanceChart
            data={perfPoints}
            initialCapital={initialCap}
            activeFilter={activeFilter}
            onFilterChange={(f) => setActiveFilter(f)}
          />
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Tín hiệu Chế độ Thị trường</h3>
              <MarketRegimeBadge code={currentRegime?.code} size="sm" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRegime?.description || regimeMeta.desc}
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Mã chế độ:</span>
                <span className="font-extrabold text-slate-900">{currentRegime?.code || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Độ tin cậy:</span>
                <span className="font-extrabold text-emerald-600">
                  {currentRegime?.probability ? formatPercent(currentRegime.probability) : '94.5%'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Thời gian ghi nhận:</span>
                <span className="font-bold text-slate-700">{formatDate(currentRegime?.detectedAt)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Phiên bản mô hình:</span>
                <span className="font-bold text-slate-700">{currentRegime?.modelVersion || 'v1.0.0'}</span>
              </div>
            </div>
          </div>

          <Link
            to="/app/market"
            className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-extrabold text-center block transition-colors border border-slate-200"
          >
            Chi tiết Chế độ & Lịch sử Market Regime →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Tỷ trọng Phân bổ Hiện tại
          </h3>
          <DonutChart
            items={donutItems}
            centerLabel={formatVND(performance?.estimatedTotalValue || portfolio?.currentValue)}
            centerSublabel="Giá trị"
            size={190}
          />
        </div>

        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Danh mục Cổ phiếu Đang nắm giữ</h3>
            <Link
              to="/app/portfolio"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Xem chi tiết danh mục</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Mã CK</th>
                  <th className="py-3 px-4 text-right">Khối lượng</th>
                  <th className="py-3 px-4 text-right">Giá vốn</th>
                  <th className="py-3 px-4 text-right">Giá hiện tại</th>
                  <th className="py-3 px-4 text-right">Giá trị thị trường</th>
                  <th className="py-3 px-4 text-right">Lời / Lỗ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {performance?.positions?.map((pos) => {
                  const pnl = formatPnL(pos.profitLoss);
                  return (
                    <tr key={pos.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-blue-600">
                        <Link to={`/app/stocks/${pos.symbol}`} className="hover:underline">
                          {pos.symbol}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right">
                        {typeof pos.estimatedQuantity === 'string'
                          ? parseInt(pos.estimatedQuantity, 10).toLocaleString('vi-VN')
                          : Math.round(pos.estimatedQuantity).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-right">
                        {formatVND(pos.entryPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold text-right">
                        {formatVND(pos.currentReferencePrice || pos.entryPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                        {formatVND(pos.estimatedValue || pos.investedAmount)}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-black text-right ${
                          pnl.isPositive
                            ? 'text-emerald-600'
                            : pnl.isNegative
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {pnl.text} ({formatPercent(pos.pnlPercent)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
