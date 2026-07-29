import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Coins,
  RefreshCw,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { DualPerformanceChart } from '@/components/common/DualPerformanceChart';
import { DonutChart } from '@/components/common/DonutChart';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { marketService } from '@/services/market-service';
import { portfolioService } from '@/services/portfolio-service';
import { recommendationService } from '@/services/recommendation-service';
import type {
  PortfolioPerformanceResponse,
  PortfolioResponse,
  RecommendationSummaryResponse,
} from '@/types/api';
import { formatVND, formatPnL, formatDate } from '@/utils/formatters';
import ReactApexChart from 'react-apexcharts';

// Bull Market Icon illustration
const BullIcon: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="64" height="64" rx="16" fill="#ECFDF5" />
    <path
      d="M18 38C18 38 21 32 28 32C35 32 37 38 46 38C52 38 54 34 54 34"
      stroke="#059669"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M20 28C22 24 26 22 30 24C32 20 38 18 44 22C48 20 52 22 52 24"
      stroke="#10B981"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="44" cy="24" r="2" fill="#047857" />
    <path
      d="M14 26L18 20M50 20L52 25"
      stroke="#047857"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformanceResponse | null>(null);
  const [pendingRecommendation, setPendingRecommendation] = useState<RecommendationSummaryResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('3M');
  const [compareBenchmark, setCompareBenchmark] = useState('VN-Index');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userHoldings, setUserHoldings] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Fetch from simulated_users.json which now contains dashboard_data
      const res = await fetch('/simulated_users.json');
      if (!res.ok) throw new Error('Cannot load simulated_users.json');
      const json = await res.json();
      if (json.dashboard_data) {
        setDashboardData(json.dashboard_data);
        console.log("a", json)
      }
      
      // Fallback for user portfolio data - loading from tier_100m demo data
      const userTier = json.tier_100m;
      if (userTier) {
        setPerformance({
          estimatedTotalValue: userTier.current_nav,
          initialCapital: userTier.initial_capital,
          profitLoss: userTier.pnl_cash,
          pnlPercent: userTier.pnl_pct,
          cashAmount: userTier.cash_left,
        } as any);

        setPortfolio({
          currentValue: userTier.current_nav,
          initialCapital: userTier.initial_capital,
          version: {
            cashAmount: userTier.cash_left,
            cashWeight: (userTier.cash_left / userTier.current_nav) * 100,
          }
        } as any);
        setUserHoldings(userTier.holdings || []);
      } else {
        setPortfolio(null);
        setPerformance(null);
        setUserHoldings([]);
      }

      // Simulate a pending recommendation to show in the UI card
      setPendingRecommendation({
        id: 'mock-rec-123',
        status: 'GENERATED',
      } as any);
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
    return (
      <ErrorState
        title="Lỗi tải dữ liệu"
        message={errorMessage}
        onRetry={loadDashboardData}
      />
    );
  }

  const currentNAV = performance?.estimatedTotalValue
    ? parseFloat(performance.estimatedTotalValue.toString())
    : portfolio?.currentValue != null
    ? parseFloat(portfolio.currentValue.toString())
    : 1234567890;

  const initialCapital = performance?.initialCapital
    ? parseFloat(performance.initialCapital.toString())
    : portfolio?.initialCapital != null
    ? parseFloat(portfolio.initialCapital.toString())
    : 1111110999;

  const pnlCash = performance?.profitLoss
    ? parseFloat(performance.profitLoss.toString())
    : currentNAV - initialCapital;

  const pnlPercent = performance?.pnlPercent
    ? parseFloat(performance.pnlPercent.toString())
    : 11.12;

  const cashAmount = performance?.cashAmount
    ? parseFloat(performance.cashAmount.toString())
    : portfolio?.version?.cashAmount || 45678900;

  const cashWeight = portfolio?.version?.cashWeight
    ? parseFloat(portfolio.version.cashWeight.toString())
    : 3.7;

  // Donut chart items
  const mappedDonutItems = userHoldings.map((h: any) => {
    const val = h.so_co_phieu * h.gia_hien_tai;
    const w = (val / currentNAV) * 100;
    return {
      symbol: h.ma_co_phieu,
      name: h.ma_co_phieu,
      weight: w,
      amount: val,
    };
  });

  const donutItems = [
    ...mappedDonutItems,
    ...(cashWeight > 0
      ? [
          {
            symbol: 'TIỀN MẶT',
            name: 'Dự trữ phòng thủ',
            weight: cashWeight,
            amount: cashAmount,
            color: '#94a3b8',
          },
        ]
      : []),
  ].sort((a, b) => b.weight - a.weight);

  // Holding table positions
  const holdingPositions = userHoldings
    .map((h: any) => {
      const val = h.so_co_phieu * h.gia_hien_tai;
      const w = ((val / currentNAV) * 100).toFixed(2) + '%';
      const pnlPct = h.gia_von > 0 ? ((h.gia_hien_tai - h.gia_von) / h.gia_von * 100) : 0;
      const pnlSign = pnlPct > 0 ? '+' : '';
      return {
        symbol: h.ma_co_phieu,
        name: h.ma_co_phieu, // fallback for name
        weight: w,
        currentPrice: h.gia_hien_tai,
        entryPrice: h.gia_von,
        value: val,
        pnl: `${pnlSign}${pnlPct.toFixed(2)}%`,
        isProfit: pnlPct >= 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Tổng quan danh mục và thị trường</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Last updated timestamp */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-500">
            <span>Last updated: 09:30:45 21/05/2025</span>
            <button
              onClick={loadDashboardData}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notifications Bell Button */}
          <Link
            to="/app/notifications"
            className="relative bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </Link>

          {/* VN-Index Badge Box */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
            <span className="font-extrabold text-slate-900">VN-Index</span>
            <span className="font-black text-slate-900">1,284.41</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>+12.61 (+0.99%)</span>
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            </span>
          </div>
        </div>
      </div>

      {/* ROW 1: 4 KEY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng giá trị danh mục */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng giá trị danh mục</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatVND(currentNAV)}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Giá trị hiện tại</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-extrabold px-2 py-1 rounded-lg ${pnlCash >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {formatPnL(pnlCash).text} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </span>
            <div className="w-12 h-4">
              <svg viewBox="0 0 40 12" className="w-full h-full text-emerald-500">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points="0,10 10,8 20,4 30,6 40,2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Lợi nhuận / Thua lỗ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Lợi nhuận / Thua lỗ</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black tracking-tight ${pnlCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatPnL(pnlCash).text}
              </span>
            </div>
            <div className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-black ${pnlCash >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>So với vốn ban đầu</span>
            <div className="w-12 h-4">
              <svg viewBox="0 0 40 12" className="w-full h-full text-emerald-500">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points="0,9 12,11 22,5 32,7 40,1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Tiền mặt */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tiền mặt</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatVND(cashAmount)}
            </div>
            <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-black">
              {cashWeight.toFixed(2)}%
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Tỷ trọng tiền mặt
          </div>
        </div>

        {/* Card 4: Đề xuất đang chờ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Đề xuất đang chờ</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {pendingRecommendation ? '2' : '0'}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Cần xem xét</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/app/recommendations"
              className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Xem ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 2: 2 MAIN COLUMNS (Left 8 cols, Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hiệu suất danh mục (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900">Hiệu suất danh mục</h2>
          </div>

          <DualPerformanceChart
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            compareBenchmark={compareBenchmark}
            onBenchmarkChange={setCompareBenchmark}
            data={dashboardData?.performance_chart}
            metrics={{
              totalProfit: pnlCash,
              totalProfitPercent: pnlPercent,
              monthProfit: pnlCash * 0.45, // mock 45% of total as month
              dayProfit: pnlCash * 0.05, // mock 5% of total as day
            }}
          />
        </div>

        {/* Right Column: Thị trường hiện tại (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Thị trường hiện tại</h2>
              <Link
                to="/app/market"
                className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Chi tiết thị trường</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bull Market Main Card Container */}
            <div className="bg-emerald-50/60 border border-emerald-200/70 p-5 rounded-2xl space-y-5">
              <div className="flex items-start gap-4">
                <BullIcon className="w-16 h-16 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-emerald-900 tracking-tight">{dashboardData?.market_regime?.status || 'BULL MARKET'}</span>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-700">Trạng thái định vị vĩ mô</div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-emerald-900">
                      <span>Confidence</span>
                      <span>{dashboardData?.market_regime?.confidence || 68}%</span>
                    </div>
                    <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${dashboardData?.market_regime?.confidence || 68}%` }} />
                    </div>
                  </div>

                  <div className="text-[11px] space-y-0.5 pt-2 text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Điểm VN-Index</span>
                      <span className="font-bold text-slate-800">{dashboardData?.market_regime?.vnindex || '1,284.41'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data date</span>
                      <span className="font-bold text-slate-800">{dashboardData?.market_regime?.date || '20/05/2025'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model version</span>
                      <span className="font-bold text-slate-800">{dashboardData?.market_regime?.model_version || 'v2.1.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-medium leading-relaxed">
              {dashboardData?.market_regime?.advice || 'Thị trường đang trong giai đoạn tăng giá với động lực tích cực. Nhà đầu tư có thể xem xét tăng tỷ trọng cổ phiếu và tập trung vào các nhóm ngành dẫn dắt.'}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: PHÂN BỔ & ĐỀ XUẤT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Phân bổ danh mục (7 cols) */}
        <div className="md:col-span-7 bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">Phân bổ danh mục</h3>
            </div>

            <DonutChart
              items={donutItems}
              centerLabel={currentNAV >= 1e9 ? `${(currentNAV / 1e9).toFixed(2)}B VNĐ` : currentNAV >= 1e6 ? `${(currentNAV / 1e6).toFixed(1)}M VNĐ` : formatVND(currentNAV)}
              centerSublabel="Tổng giá trị"
              size={180}
            />
          </div>

          <div className="pt-2">
            <Link
              to="/app/portfolio"
              className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Xem chi tiết danh mục</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Đề xuất cần xem xét (5 cols) */}
        <div className="md:col-span-5 bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">Đề xuất cần xem xét</h3>
              <Link
                to="/app/recommendations"
                className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Rebalance Highlight Card */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                REBALANCE
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">Đề xuất tái cơ cấu danh mục</h4>
                <div className="text-[11px] font-medium text-slate-500">Ngày tạo: {pendingRecommendation?.generatedAt ? formatDate(pendingRecommendation.generatedAt) : formatDate(new Date().toISOString())}</div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Thị trường thay đổi, danh mục của bạn có thể cần được điều chỉnh để tối ưu hiệu suất.
              </p>

              <div className="pt-2 border-t border-amber-200/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Thay đổi cổ phiếu</span>
                  <span className="font-bold text-slate-900">{pendingRecommendation ? 3 : 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tổng giá trị</span>
                  <span className="font-bold text-slate-900">{formatVND(currentNAV)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Hết hạn sau</span>
                  <span className="font-extrabold text-amber-700">2 ngày</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={pendingRecommendation ? `/app/recommendations/${pendingRecommendation.id}` : '/app/recommendations'}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1 shadow-md transition-all"
                >
                  <span>Xem đề xuất</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: DANH MỤC NẮM GIỮ (FULL ROW) */}
      <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-900">Danh mục nắm giữ</h3>
          <Link
            to="/app/portfolio"
            className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-4">Mã cổ phiếu</th>
                <th className="py-2.5 px-4">Tên công ty</th>
                <th className="py-2.5 px-4 text-right">Tỷ trọng</th>
                <th className="py-2.5 px-4 text-right">Giá hiện tại</th>
                <th className="py-2.5 px-4 text-right">Giá vốn</th>
                <th className="py-2.5 px-4 text-right">Giá trị hiện tại</th>
                <th className="py-2.5 px-4 text-right">Lãi/Lỗ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {holdingPositions.map((row: any) => (
                <tr key={row.symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-black text-blue-600">{row.symbol}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{row.name}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">{row.weight}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{row.currentPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{row.entryPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{row.value.toLocaleString('vi-VN')}</td>
                  <td className={`py-3 px-4 text-right font-black ${row.isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>{row.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
