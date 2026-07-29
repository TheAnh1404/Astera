import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { portfolioService } from '@/services/portfolio-service';
import { marketService } from '@/services/market-service';
import type {
  MarketRegimeView,
  PortfolioPerformanceResponse,
  PortfolioResponse,
  PortfolioVersionsResponse,
} from '@/types/api';
import {
  formatDate,
  formatPercent,
  formatVND,
} from '@/utils/formatters';
import { DonutChart } from '@/components/common/DonutChart';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Download,
  Edit3,
  History,
  Info,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformanceResponse | null>(null);
  const [versions, setVersions] = useState<PortfolioVersionsResponse | null>(null);
  const [_currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'allocation' | 'performance' | 'history'>('overview');
  const [activeFilter, setActiveFilter] = useState('3M');

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [pData, perfData, vData, regimeData] = await Promise.all([
        portfolioService.getCurrent(),
        portfolioService.getPerformance(),
        portfolioService.getVersions(),
        marketService.getCurrentRegime().catch(() => null),
      ]);

      setPortfolio(pData);
      setPerformance(perfData);
      setVersions(vData);
      setCurrentRegime(regimeData);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải thông tin danh mục đầu tư.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculate = async () => {
    try {
      setIsActionLoading(true);
      const rec = await portfolioService.recalculate();
      navigate(`/app/recommendations/${rec.id}`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể tạo yêu cầu tính lại danh mục.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRebalance = async () => {
    try {
      setIsActionLoading(true);
      const rec = await portfolioService.rebalance();
      navigate(`/app/recommendations/${rec.id}`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Không thể tạo yêu cầu tái cân bằng danh mục.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={6} />
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorState title="Lỗi danh mục" message={errorMessage} onRetry={loadData} />;
  }

  // Fallback / Normalized Data values
  const currentNAV = performance?.estimatedTotalValue
    ? parseFloat(performance.estimatedTotalValue.toString())
    : portfolio?.currentValue != null
    ? parseFloat(portfolio.currentValue.toString())
    : 1234567890;

  const initialCapital = performance?.initialCapital
    ? parseFloat(performance.initialCapital.toString())
    : portfolio?.initialCapital != null
    ? parseFloat(portfolio.initialCapital.toString())
    : 1111111101;

  const pnlCash = performance?.profitLoss
    ? parseFloat(performance.profitLoss.toString())
    : 123456789;

  const pnlPercent = performance?.pnlPercent
    ? parseFloat(performance.pnlPercent.toString())
    : 11.12;

  const cashAmount = performance?.cashAmount
    ? parseFloat(performance.cashAmount.toString())
    : portfolio?.version?.cashAmount != null
    ? parseFloat(portfolio.version.cashAmount.toString())
    : 45678900;

  const cashWeight = portfolio?.version?.cashWeight != null
    ? parseFloat(portfolio.version.cashWeight.toString())
    : 3.7;

  // Chart data
  const chartData = [
    { date: '21/02', portfolio: 0.0, benchmark: 0.0 },
    { date: '28/02', portfolio: 1.2, benchmark: 0.8 },
    { date: '07/03', portfolio: 1.5, benchmark: 2.1 },
    { date: '14/03', portfolio: 2.8, benchmark: 1.9 },
    { date: '21/03', portfolio: 4.5, benchmark: 3.2 },
    { date: '28/03', portfolio: 4.2, benchmark: 2.8 },
    { date: '04/04', portfolio: 6.8, benchmark: 4.1 },
    { date: '11/04', portfolio: 9.1, benchmark: 6.2 },
    { date: '18/04', portfolio: 8.5, benchmark: 5.8 },
    { date: '25/04', portfolio: 4.1, benchmark: 2.1 },
    { date: '02/05', portfolio: 7.2, benchmark: 4.8 },
    { date: '09/05', portfolio: 9.8, benchmark: 6.9 },
    { date: '16/05', portfolio: 10.2, benchmark: 5.2 },
    { date: '21/05', portfolio: 11.12, benchmark: 6.47 },
  ];

  const pointsCount = chartData.length;
  const chartWidth = 600;
  const chartHeight = 200;

  const getCoords = (val: number, idx: number) => {
    const x = (idx / (pointsCount - 1)) * chartWidth;
    const y = chartHeight - ((val - (-5)) / 22) * chartHeight;
    return { x, y };
  };

  const portPoints = chartData
    .map((d, i) => {
      const { x, y } = getCoords(d.portfolio, i);
      return `${x},${y}`;
    })
    .join(' ');

  const benchPoints = chartData
    .map((d, i) => {
      const { x, y } = getCoords(d.benchmark, i);
      return `${x},${y}`;
    })
    .join(' ');

  const zeroY = chartHeight - ((0 - (-5)) / 22) * chartHeight;

  // Stock holdings table data
  const defaultHoldings = [
    { symbol: 'FPT', companyName: 'CTCP FPT', weight: 25.0, investedAmount: 308641973, refPrice: 125000, currentPrice: 138000, currentValue: 340755000, pnlCash: 32113027, pnlPercent: 10.4 },
    { symbol: 'VCB', companyName: 'Vietcombank', weight: 20.0, investedAmount: 234567890, refPrice: 92300, currentPrice: 102800, currentValue: 260123200, pnlCash: 25555310, pnlPercent: 10.9 },
    { symbol: 'VHM', companyName: 'Vinhomes', weight: 15.0, investedAmount: 175925926, refPrice: 74800, currentPrice: 82500, currentValue: 208368750, pnlCash: 32442824, pnlPercent: 18.43 },
    { symbol: 'HPG', companyName: 'Hòa Phát', weight: 12.0, investedAmount: 140740741, refPrice: 28900, currentPrice: 31800, currentValue: 146231200, pnlCash: 5490459, pnlPercent: 3.9 },
    { symbol: 'MWG', companyName: 'Thế Giới Di Động', weight: 10.0, investedAmount: 117283945, refPrice: 62100, currentPrice: 66400, currentValue: 125188800, pnlCash: 7902855, pnlPercent: 6.75 },
    { symbol: 'MBB', companyName: 'MB Bank', weight: 8.3, investedAmount: 96875463, refPrice: 22300, currentPrice: 24100, currentValue: 104724100, pnlCash: 7848637, pnlPercent: 8.09 },
  ];

  const holdings = portfolio?.version?.allocations?.length
    ? portfolio.version.allocations.map((alloc) => {
        const posPerf = performance?.positions?.find((p) => p.symbol === alloc.symbol);
        const w = typeof alloc.weight === 'string' ? parseFloat(alloc.weight) : alloc.weight;
        const inv = typeof alloc.investedAmount === 'string' ? parseFloat(alloc.investedAmount) : alloc.investedAmount;
        const entry = typeof alloc.entryPrice === 'string' ? parseFloat(alloc.entryPrice) : alloc.entryPrice;
        const currP = posPerf?.currentReferencePrice ? (typeof posPerf.currentReferencePrice === 'string' ? parseFloat(posPerf.currentReferencePrice) : posPerf.currentReferencePrice) : entry;
        const currVal = posPerf?.estimatedValue ? (typeof posPerf.estimatedValue === 'string' ? parseFloat(posPerf.estimatedValue) : posPerf.estimatedValue) : inv;
        const pCash = posPerf?.profitLoss ? (typeof posPerf.profitLoss === 'string' ? parseFloat(posPerf.profitLoss) : posPerf.profitLoss) : currVal - inv;
        const pPct = inv > 0 ? (pCash / inv) * 100 : 0;
        return {
          symbol: alloc.symbol,
          companyName: alloc.companyName,
          weight: w,
          investedAmount: inv,
          refPrice: entry,
          currentPrice: currP,
          currentValue: currVal,
          pnlCash: pCash,
          pnlPercent: pPct,
        };
      })
    : defaultHoldings;

  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnlCash = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnlCash / totalInvested) * 100 : 0;

  // Sector donut chart items
  const sectorItems = [
    { symbol: 'Công nghệ thông tin', name: 'Công nghệ thông tin', weight: 25.0, amount: 340755000, color: '#3b82f6' },
    { symbol: 'Ngân hàng', name: 'Ngân hàng', weight: 28.3, amount: 364847300, color: '#0066ff' },
    { symbol: 'Bất động sản', name: 'Bất động sản', weight: 15.0, amount: 208368750, color: '#10b981' },
    { symbol: 'Vật liệu', name: 'Vật liệu', weight: 12.0, amount: 146231200, color: '#eab308' },
    { symbol: 'Bán lẻ', name: 'Bán lẻ', weight: 10.0, amount: 125188800, color: '#f97316' },
    { symbol: 'Tiền mặt', name: 'Dự trữ phòng thủ', weight: cashWeight, amount: cashAmount, color: '#94a3b8' },
    { symbol: 'Khác', name: 'Khác', weight: 5.0, amount: 65000000, color: '#a855f7' },
  ];

  // Versions history items fallback
  const versionItems = versions?.items?.length
    ? versions.items
    : [
        { id: 'v3', versionNumber: 3, changeType: 'REBALANCE', regime: 'BULL MARKET', totalValue: 1234567890, effectiveAt: '2025-05-20T00:00:00Z', pnlPct: 11.12 },
        { id: 'v2', versionNumber: 2, changeType: 'REBALANCE', regime: 'SIDEWAY MARKET', totalValue: 1180000000, effectiveAt: '2025-04-10T00:00:00Z', pnlPct: 6.35 },
        { id: 'v1', versionNumber: 1, changeType: 'INITIAL', regime: 'SIDEWAY MARKET', totalValue: 1111111101, effectiveAt: '2025-03-20T00:00:00Z', pnlPct: 0.0 },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Portfolio</span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
            <Link to="/app" className="hover:text-slate-600 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-bold">Portfolio</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span>Last updated: 09:30:45 21/05/2025</span>
            <button onClick={loadData} className="hover:rotate-180 transition-transform duration-300">
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tổng quan
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'allocation'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Phân bổ
            {activeTab === 'allocation' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'performance'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hiệu suất
            {activeTab === 'performance' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Lịch sử phiên bản
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* 5 Top Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Giá trị danh mục */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Giá trị danh mục</div>
          <div className="text-xl font-black text-slate-900">{formatVND(currentNAV)}</div>
          <div className="text-[11px] text-slate-400 font-semibold pt-1">Cập nhật 09:30 21/05/2025</div>
        </div>

        {/* Card 2: Lợi nhuận / Thua lỗ */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lợi nhuận / Thua lỗ</div>
          <div className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>+{formatVND(pnlCash)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="font-bold text-emerald-600">+{pnlPercent}%</span>
            <span className="text-slate-400 font-medium">So với vốn ban đầu</span>
          </div>
        </div>

        {/* Card 3: Vốn đầu tư ban đầu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vốn đầu tư ban đầu</div>
          <div className="text-xl font-black text-slate-900">{formatVND(initialCapital)}</div>
        </div>

        {/* Card 4: Lãi suất đầu tư */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lãi suất đầu tư</div>
          <div className="text-xl font-black text-emerald-600">+{pnlPercent}%</div>
          <div className="text-[11px] text-slate-400 font-medium">Tổng tỷ suất sinh lời</div>
        </div>

        {/* Card 5: Tiền mặt */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiền mặt</div>
          <div className="text-xl font-black text-slate-900">{formatVND(cashAmount)}</div>
          <div className="text-[11px] text-slate-400 font-medium">{cashWeight.toFixed(2)}% danh mục</div>
        </div>
      </div>

      {/* Main Grid Section (Left col-span-2, Right col-span-1) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Performance Chart + Holdings Table) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Card */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">Hiệu suất danh mục</h3>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    {['1M', '3M', '6M', '1Y', 'ALL'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          activeFilter === f
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-6 text-xs font-bold pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-slate-600">Danh mục của bạn</span>
                  <span className="text-blue-600 font-extrabold">+11.12%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600">VN-Index</span>
                  <span className="text-slate-600 font-extrabold">+6.47%</span>
                </div>
              </div>

              {/* Line Chart Graphic */}
              <div className="relative w-full h-[210px] overflow-hidden pt-2">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full">
                  <line x1="0" y1={zeroY} x2={chartWidth} y2={zeroY} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                  <polyline fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" points={benchPoints} />
                  <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={portPoints} />

                  {/* End Markers */}
                  {chartData.length > 0 && (() => {
                    const lastIdx = chartData.length - 1;
                    const lastPort = getCoords(chartData[lastIdx].portfolio, lastIdx);
                    const lastBench = getCoords(chartData[lastIdx].benchmark, lastIdx);
                    return (
                      <>
                        <circle cx={lastPort.x} cy={lastPort.y} r="5" className="fill-blue-600 stroke-white stroke-2" />
                        <rect x={lastPort.x - 22} y={lastPort.y - 20} width="44" height="16" rx="4" fill="#2563eb" />
                        <text x={lastPort.x} y={lastPort.y - 8} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                          +11.12%
                        </text>

                        <circle cx={lastBench.x} cy={lastBench.y} r="4" className="fill-slate-400 stroke-white stroke-2" />
                        <rect x={lastBench.x - 20} y={lastBench.y + 6} width="40" height="16" rx="4" fill="#94a3b8" />
                        <text x={lastBench.x} y={lastBench.y + 18} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                          +6.47%
                        </text>
                      </>
                    );
                  })()}
                </svg>

                <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1 px-1">
                  {chartData.filter((_, idx) => idx % 2 === 0).map((d) => (
                    <span key={d.date}>{d.date}</span>
                  ))}
                </div>
              </div>

              {/* 5 Bottom Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (3M)</div>
                  <div className="text-xs font-black text-emerald-600">+123,456,789 ₫</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (%) (3M)</div>
                  <div className="text-xs font-black text-emerald-600">+11.12%</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (1M)</div>
                  <div className="text-xs font-black text-emerald-600">+23,456,789 ₫</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (1W)</div>
                  <div className="text-xs font-black text-emerald-600">+5,678,900 ₫</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (1D)</div>
                  <div className="text-xs font-black text-emerald-600">+678,900 ₫</div>
                </div>
              </div>
            </div>

            {/* Danh mục nắm giữ Table */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">Danh mục nắm giữ</h3>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải báo cáo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('allocation')}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>Xem chi tiết phân bổ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                      <th className="py-3 px-3">Mã CK</th>
                      <th className="py-3 px-3">Công ty</th>
                      <th className="py-3 px-3 text-right">Tỷ trọng</th>
                      <th className="py-3 px-3 text-right">Số tiền đầu tư (đ)</th>
                      <th className="py-3 px-3 text-right">Giá tham chiếu (đ)</th>
                      <th className="py-3 px-3 text-right">Giá hiện tại (đ)</th>
                      <th className="py-3 px-3 text-right">Giá trị hiện tại (đ)</th>
                      <th className="py-3 px-3 text-right">Lãi / Lỗ (đ)</th>
                      <th className="py-3 px-3 text-right">Lãi / Lỗ (%)</th>
                      <th className="py-3 px-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {holdings.map((row) => (
                      <tr key={row.symbol} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-black text-blue-600">
                          <Link to={`/app/stocks/${row.symbol}`} className="hover:underline">
                            {row.symbol}
                          </Link>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 truncate max-w-[130px]">
                          {row.companyName}
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900 text-right">
                          {formatPercent(row.weight)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-semibold text-right">
                          {formatVND(row.investedAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-right">
                          {formatVND(row.refPrice)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-900 font-bold text-right">
                          {formatVND(row.currentPrice)}
                        </td>
                        <td className="py-3.5 px-3 font-black text-slate-900 text-right">
                          {formatVND(row.currentValue)}
                        </td>
                        <td className="py-3.5 px-3 font-black text-emerald-600 text-right">
                          +{formatVND(row.pnlCash)}
                        </td>
                        <td className="py-3.5 px-3 font-black text-emerald-600 text-right">
                          +{formatPercent(row.pnlPercent)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <Link
                            to={`/app/stocks/${row.symbol}`}
                            className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {/* Cash Row */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-black text-slate-700">Tiền mặt</td>
                      <td className="py-3.5 px-3 font-medium text-slate-500">Cash</td>
                      <td className="py-3.5 px-3 font-bold text-slate-700 text-right">{cashWeight.toFixed(2)}%</td>
                      <td className="py-3.5 px-3 text-slate-400 text-right">—</td>
                      <td className="py-3.5 px-3 text-slate-400 text-right">—</td>
                      <td className="py-3.5 px-3 text-slate-400 text-right">—</td>
                      <td className="py-3.5 px-3 font-bold text-slate-700 text-right">{formatVND(cashAmount)}</td>
                      <td className="py-3.5 px-3 text-slate-400 text-right">—</td>
                      <td className="py-3.5 px-3 text-slate-400 text-right">—</td>
                      <td className="py-3.5 px-3 text-center">—</td>
                    </tr>
                  </tbody>

                  {/* Summary Total Row */}
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-black text-xs">
                      <td className="py-3.5 px-3 text-slate-900" colSpan={2}>
                        Tổng
                      </td>
                      <td className="py-3.5 px-3 text-slate-900 text-right">100.00%</td>
                      <td className="py-3.5 px-3 text-slate-900 text-right">{formatVND(totalInvested)}</td>
                      <td className="py-3.5 px-3" colSpan={2}></td>
                      <td className="py-3.5 px-3 text-slate-900 text-right">{formatVND(totalCurrentValue + cashAmount)}</td>
                      <td className="py-3.5 px-3 text-emerald-600 text-right">+{formatVND(totalPnlCash)}</td>
                      <td className="py-3.5 px-3 text-emerald-600 text-right">+{formatPercent(totalPnlPercent)}</td>
                      <td className="py-3.5 px-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Cards) */}
          <div className="space-y-6">
            {/* Sidebar Card 1: Thông tin danh mục */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Thông tin danh mục</h3>
                <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  <span>Chỉnh sửa</span>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Phiên bản hiện tại</span>
                  <span className="font-extrabold text-slate-900">
                    Version {portfolio?.currentVersion || 3}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Loại danh mục</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {portfolio?.version?.changeType || 'REBALANCE'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Ngày tạo</span>
                  <span className="font-semibold text-slate-700">20/05/2025</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Cập nhật lần cuối</span>
                  <span className="font-semibold text-slate-700">21/05/2025 09:30</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trạng thái</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">
                    ĐANG HOẠT ĐỘNG
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Nguồn đề xuất</span>
                  <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                    Rebalance #R-20250520-02
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Thị trường tại thời điểm tạo</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">
                    BULL MARKET
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleRecalculate}
                  disabled={isActionLoading}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tính lại danh mục</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>Xem lịch sử phiên bản</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sidebar Card 2: Phân bổ theo nhóm ngành */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-slate-900">Phân bổ theo nhóm ngành</h3>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <button
                  onClick={() => setActiveTab('allocation')}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <DonutChart
                items={sectorItems}
                centerLabel="100%"
                centerSublabel=""
              />

              <div className="text-[11px] text-slate-400 font-medium text-center pt-1 border-t border-slate-100">
                Dữ liệu phân bổ theo ngành cấp 2 (GICS)
              </div>
            </div>

            {/* Sidebar Card 3: Lịch sử phiên bản */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Lịch sử phiên bản</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {versionItems.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">Version {v.versionNumber}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">
                          {v.changeType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{formatDate(v.effectiveAt)}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">
                          {v.regime}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-black text-emerald-600">
                      +{(v as { pnlPct?: number }).pnlPct || 11.12}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Phân bổ (Allocation) */}
      {activeTab === 'allocation' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Phân bổ Chi tiết Tài sản & Nhóm ngành</h3>
              <p className="text-xs text-slate-500 mt-1">Phân tích tỷ trọng nắm giữ cổ phiếu và phân bổ theo từng ngành GICS.</p>
            </div>
            <button
              onClick={handleRebalance}
              disabled={isActionLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tái cân bằng (Rebalance)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Phân bổ Ngành (GICS Sector)</h4>
              <DonutChart items={sectorItems} centerLabel="100%" centerSublabel="Tổng phân bổ" />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Chi tiết Tỷ trọng Nắm giữ</h4>
              <div className="space-y-2.5">
                {holdings.map((h) => (
                  <div key={h.symbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{h.symbol} - {h.companyName}</span>
                      <span className="text-blue-600">{formatPercent(h.weight)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(h.weight, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hiệu suất (Performance) */}
      {activeTab === 'performance' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Phân tích Hiệu suất & Benchmark</h3>
              <p className="text-xs text-slate-500 mt-1">So sánh tăng trưởng danh mục với VN-Index qua các khoảng thời gian.</p>
            </div>
          </div>

          {/* Expanded Performance Chart */}
          <div className="relative w-full h-[280px] overflow-hidden pt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full">
              <line x1="0" y1={zeroY} x2={chartWidth} y2={zeroY} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
              <polyline fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" points={benchPoints} />
              <polyline fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={portPoints} />
            </svg>
          </div>
        </div>
      )}

      {/* Tab: Lịch sử phiên bản (Version History) */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-black text-slate-900">Lịch sử Phiên bản Danh mục</h3>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi lịch sử tái cân bằng và thay đổi danh mục qua từng thời kỳ.</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Tổng số phiên bản: {versionItems.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {versionItems.map((v) => (
              <div
                key={v.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">
                      Phiên bản v{v.versionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 uppercase">
                      {v.changeType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase">
                      {v.regime}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ngày hiệu lực: <strong>{formatDate(v.effectiveAt)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Giá trị danh mục</div>
                    <div className="text-sm font-black text-slate-900">{formatVND(v.totalValue)}</div>
                  </div>

                  <Link
                    to={`/app/portfolio/version/${v.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
