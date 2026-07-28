import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { portfolioService } from '@/services/portfolio-service';
import type { PortfolioVersionResponse } from '@/types/api';
import { formatDate, formatPercent, formatVND } from '@/utils/formatters';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ArrowLeft } from 'lucide-react';

export const PortfolioVersionDetailPage: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const [version, setVersion] = useState<PortfolioVersionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadVersionData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentPortfolio = await portfolioService.getCurrent();
        if (currentPortfolio && currentPortfolio.version.id === versionId) {
          setVersion(currentPortfolio.version);
        } else if (currentPortfolio) {
          setVersion(currentPortfolio.version);
        }
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'message' in err) {
          setErrorMessage((err as { message: string }).message);
        } else {
          setErrorMessage('Không thể tải chi tiết phiên bản danh mục.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadVersionData();
  }, [versionId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (errorMessage || !version) {
    return (
      <ErrorState
        title="Lỗi tải phiên bản"
        message={errorMessage || 'Không tìm thấy phiên bản danh mục.'}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to="/app/portfolio"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang Danh mục</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900">
              Chi tiết Phiên bản v{version.versionNumber}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase border border-blue-200">
              {version.changeType}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Ngày hiệu lực: {formatDate(version.effectiveAt)} • Chế độ thị trường: {version.regime}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-semibold uppercase">Tổng giá trị phiên bản</div>
          <div className="text-2xl font-black text-slate-900">{formatVND(version.totalValue)}</div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900">
          Danh mục Cổ phiếu Phiên bản v{version.versionNumber}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Mã CK</th>
                <th className="py-3 px-4">Tên công ty</th>
                <th className="py-3 px-4 text-right">Tỷ trọng</th>
                <th className="py-3 px-4 text-right">Số tiền phân bổ</th>
                <th className="py-3 px-4 text-right">Giá vào lệnh</th>
                <th className="py-3 px-4 text-right">Khối lượng ước tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {version.allocations?.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-black text-blue-600">{alloc.symbol}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{alloc.companyName}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 text-right">
                    {formatPercent(alloc.weight)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-right">
                    {formatVND(alloc.investedAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-right">
                    {formatVND(alloc.entryPrice)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right">
                    {typeof alloc.estimatedQuantity === 'string'
                      ? parseInt(alloc.estimatedQuantity, 10).toLocaleString('vi-VN')
                      : Math.round(alloc.estimatedQuantity).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {parseFloat(version.cashAmount.toString()) > 0 && (
                <tr className="bg-slate-50 font-bold">
                  <td className="py-3.5 px-4 text-slate-500">TIỀN MẶT</td>
                  <td className="py-3.5 px-4 text-slate-500">Dự trữ phòng thủ</td>
                  <td className="py-3.5 px-4 text-slate-900 text-right">
                    {formatPercent(version.cashWeight)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 text-right">
                    {formatVND(version.cashAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">-</td>
                  <td className="py-3.5 px-4 text-right text-slate-400">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
