import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { portfolioService } from '@/services/portfolio-service';
import type {
  PortfolioPerformanceResponse,
  PortfolioResponse,
  PortfolioVersionsResponse,
} from '@/types/api';
import {
  formatDate,
  formatPercent,
  formatPnL,
  formatVND,
} from '@/utils/formatters';
import { DonutChart } from '@/components/common/DonutChart';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformanceResponse | null>(null);
  const [versions, setVersions] = useState<PortfolioVersionsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [pData, perfData, vData] = await Promise.all([
        portfolioService.getCurrent(),
        portfolioService.getPerformance(),
        portfolioService.getVersions(),
      ]);

      setPortfolio(pData);
      setPerformance(perfData);
      setVersions(vData);
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
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={6} />
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorState title="Lỗi danh mục" message={errorMessage} onRetry={loadData} />;
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Chi tiết Danh mục Đầu tư</h2>
          <p className="text-xs text-slate-500 font-medium">
            Tên danh mục: {portfolio?.name || 'Astera AI Portfolio'} • Phiên bản hiện tại: v
            {portfolio?.currentVersion}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={isActionLoading}
            className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tính lại danh mục</span>
          </button>

          <button
            onClick={handleRebalance}
            disabled={isActionLoading}
            className="btn-primary text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tái cân bằng (Rebalance)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Vốn ban đầu</div>
          <div className="text-xl font-black text-slate-900">
            {formatVND(portfolio?.initialCapital)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Giá trị ước tính</div>
          <div className="text-xl font-black text-blue-600">
            {formatVND(performance?.estimatedTotalValue || portfolio?.currentValue)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Lời / Lỗ (PnL)</div>
          <div
            className={`text-xl font-black ${
              pnlMeta.isPositive
                ? 'text-emerald-600'
                : pnlMeta.isNegative
                ? 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {pnlMeta.text} ({pnlPercentText})
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Tiền mặt phòng thủ</div>
          <div className="text-xl font-black text-slate-700">
            {formatVND(performance?.cashAmount || portfolio?.version?.cashAmount)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Tỷ trọng Phân bổ
          </h3>
          <DonutChart
            items={donutItems}
            centerLabel={formatVND(performance?.estimatedTotalValue || portfolio?.currentValue)}
            centerSublabel="Giá trị"
          />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Chi tiết Mã Cổ phiếu Nắm giữ</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Mã CK</th>
                  <th className="py-3 px-4">Công ty</th>
                  <th className="py-3 px-4 text-right">Tỷ trọng</th>
                  <th className="py-3 px-4 text-right">Khối lượng</th>
                  <th className="py-3 px-4 text-right">Giá vốn</th>
                  <th className="py-3 px-4 text-right">Giá hiện tại</th>
                  <th className="py-3 px-4 text-right">Giá trị</th>
                  <th className="py-3 px-4 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {portfolio?.version?.allocations?.map((alloc) => {
                  const posPerf = performance?.positions?.find((p) => p.symbol === alloc.symbol);
                  const pnl = formatPnL(posPerf?.profitLoss);
                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-blue-600">
                        <Link to={`/app/stocks/${alloc.symbol}`} className="hover:underline">
                          {alloc.symbol}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[140px] truncate">
                        {alloc.companyName}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right">
                        {formatPercent(alloc.weight)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right">
                        {typeof alloc.estimatedQuantity === 'string'
                          ? parseInt(alloc.estimatedQuantity, 10).toLocaleString('vi-VN')
                          : Math.round(alloc.estimatedQuantity).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-right">
                        {formatVND(alloc.entryPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold text-right">
                        {formatVND(posPerf?.currentReferencePrice || alloc.entryPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                        {formatVND(posPerf?.estimatedValue || alloc.investedAmount)}
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
                        {pnl.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Lịch sử Các Phiên bản Danh mục</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Tổng số phiên bản: {versions?.items?.length || 0}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {versions?.items?.map((v) => (
            <div
              key={v.id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-2xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    Phiên bản v{v.versionNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                    {v.changeType}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Chế độ thị trường: <strong>{v.regime}</strong> • Ngày hiệu lực:{' '}
                  {formatDate(v.effectiveAt)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Tổng giá trị</div>
                  <div className="text-sm font-black text-slate-900">{formatVND(v.totalValue)}</div>
                </div>

                <Link
                  to={`/app/portfolio/version/${v.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
