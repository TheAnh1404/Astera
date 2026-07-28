import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '@/services/recommendation-service';
import { marketService } from '@/services/market-service';
import type { MarketRegimeView, RecommendationSummaryResponse } from '@/types/api';
import {
  formatDate,
  formatVND,
  getRecommendationStatusMeta,
  getRecommendationTypeLabel,
} from '@/utils/formatters';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import { LiveDemoPageHeader } from '@/components/common/LiveDemoPageHeader';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowRight } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationSummaryResponse[]>([]);
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [res, regime] = await Promise.all([
        recommendationService.list(1, 50),
        marketService.getCurrentRegime().catch(() => null),
      ]);
      setRecommendations(res.items || []);
      setCurrentRegime(regime);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải danh sách đề xuất AI.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const filteredItems = recommendations.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.status === activeTab;
  });

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'GENERATED', label: 'Chờ xử lý' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'APPLIED', label: 'Đã áp dụng' },
    { key: 'DISMISSED', label: 'Đã bỏ qua' },
    { key: 'EXPIRED', label: 'Hết hạn' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="table" count={6} />
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorState title="Lỗi tải danh sách đề xuất" message={errorMessage} onRetry={loadRecommendations} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <LiveDemoPageHeader
        title="Danh sách Đề xuất AI"
        description="Theo dõi toàn bộ tín hiệu phân bổ vốn, tính lại và tái cân bằng theo từng chế độ thị trường."
        regime={currentRegime}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đề xuất"
          description="Chưa có đề xuất danh mục nào phù hợp với bộ lọc đã chọn."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-5">Ngày tạo</th>
                  <th className="py-3.5 px-5">Loại đề xuất</th>
                  <th className="py-3.5 px-5">Chế độ thị trường</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Quy mô vốn</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => {
                  const statusMeta = getRecommendationStatusMeta(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {formatDate(item.generatedAt)}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-slate-800">
                        {getRecommendationTypeLabel(item.type)}
                      </td>
                      <td className="py-4 px-5">
                        <MarketRegimeBadge code={item.regime} size="sm" />
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.bg}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 text-right">
                        {formatVND(item.capital)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/app/recommendations/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
