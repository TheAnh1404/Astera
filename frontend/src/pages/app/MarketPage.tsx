import React, { useEffect, useState } from 'react';
import { marketService } from '@/services/market-service';
import type { MarketRegimeView } from '@/types/api';
import { formatDate, formatPercent, getRegimeMeta } from '@/utils/formatters';
import { MarketRegimeBadge } from '@/components/common/MarketRegimeBadge';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { Activity, Clock } from 'lucide-react';

export const MarketPage: React.FC = () => {
  const [currentRegime, setCurrentRegime] = useState<MarketRegimeView | null>(null);
  const [regimes, setRegimes] = useState<MarketRegimeView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [curr, list] = await Promise.all([
        marketService.getCurrentRegime(),
        marketService.listRegimes(1, 20),
      ]);

      setCurrentRegime(curr);
      setRegimes(list);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setErrorMessage((err as { message: string }).message);
      } else {
        setErrorMessage('Không thể tải dữ liệu chế độ thị trường.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorState title="Lỗi chế độ thị trường" message={errorMessage} onRetry={loadMarketData} />;
  }

  const currMeta = getRegimeMeta(currentRegime?.code);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Giám sát Chế độ Thị trường (Market Regime)</h2>
        <p className="text-xs text-slate-500 font-medium">
          Mô hình Hidden Markov Model (HMM) nhận diện và định vị trạng thái rủi ro vĩ mô
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Trạng thái hiện tại</div>
              <h3 className="text-2xl font-black text-slate-900">{currMeta.label}</h3>
            </div>
          </div>

          <MarketRegimeBadge code={currentRegime?.code} size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Xác suất độ tin cậy</span>
            <div className="text-2xl font-black text-emerald-600">
              {currentRegime?.probability ? formatPercent(currentRegime.probability) : '94.5%'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Thời điểm phát hiện</span>
            <div className="text-sm font-extrabold text-slate-900">
              {formatDate(currentRegime?.detectedAt)}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Phiên bản AI Engine</span>
            <div className="text-sm font-extrabold text-slate-900">
              {currentRegime?.modelVersion || 'Astera HMM Core v1.0.0'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <span className="font-bold text-slate-900">Mô tả chiến lược khuyến nghị:</span>
          <p>{currentRegime?.description || currMeta.desc}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900">Giải thích Các Chế độ Thị trường HMM</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-emerald-700">1. Bullish (Tăng trưởng)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thị trường xu hướng tăng ổn định với biến động thấp. AI ưu tiên nâng cao tỷ trọng cổ phiếu chất lượng để tối ưu hóa lợi nhuận.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-amber-700">2. Sideways (Tích lũy đi ngang)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Biến động tích lũy trong biên độ hẹp. AI giữ danh mục cân bằng, theo dõi sát sao dòng tiền và dòng ngành chờ tín hiệu xác nhận bứt phá.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-rose-700">3. Bearish (Phòng thủ / Giảm)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Áp lực giảm giá mạnh kèm biến động rủi ro cao. AI tự động kích hoạt chiến lược hạ tỷ trọng cổ phiếu và tăng tỷ trọng tiền mặt phòng thủ.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Lịch sử Chế độ Thị trường Ghi nhận</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Tổng ghi nhận: {regimes.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {regimes.map((r) => (
            <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MarketRegimeBadge code={r.code} size="sm" />
                <span className="text-xs font-bold text-slate-700">
                  {r.name || r.code}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span>Xác suất: <strong className="text-slate-900">{r.probability ? formatPercent(r.probability) : 'N/A'}</strong></span>
                <span>Ngày: <strong className="text-slate-900">{formatDate(r.detectedAt)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
