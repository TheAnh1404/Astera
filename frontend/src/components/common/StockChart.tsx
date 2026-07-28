import React, { useState } from 'react';
import type { StockPricePoint } from '@/types/api';
import { formatDate, formatVND } from '@/utils/formatters';

interface StockChartProps {
  prices: StockPricePoint[];
  symbol: string;
  height?: number;
  onRangeChange?: (range: string) => void;
  activeRange?: string;
}

export const StockChart: React.FC<StockChartProps> = ({
  prices,
  symbol,
  height = 280,
  onRangeChange,
  activeRange = '1y',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<StockPricePoint | null>(null);

  const ranges = ['1m', '3m', '6m', '1y', '3y', 'max'];

  if (!prices || prices.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
        Chưa có dữ liệu biến động giá cho mã cổ phiếu {symbol}.
      </div>
    );
  }

  const closePrices = prices.map((p) => (typeof p.closePrice === 'string' ? parseFloat(p.closePrice) : p.closePrice));
  const minPrice = Math.min(...closePrices) * 0.98;
  const maxPrice = Math.max(...closePrices) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  const firstPrice = closePrices[0];
  const lastPrice = closePrices[closePrices.length - 1];
  const isPositiveChange = lastPrice >= firstPrice;

  const strokeColor = isPositiveChange ? '#10b981' : '#f43f5e';
  const gradientId = `stockGrad_${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

  const pointsString = prices
    .map((p, idx) => {
      const val = typeof p.closePrice === 'string' ? parseFloat(p.closePrice) : p.closePrice;
      const x = (idx / (prices.length - 1 || 1)) * 500;
      const y = 180 - ((val - minPrice) / priceRange) * 150;
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `0,180 ${pointsString} 500,180`;

  const activePoint = hoveredPoint || prices[prices.length - 1];
  const activeClose = typeof activePoint.closePrice === 'string' ? parseFloat(activePoint.closePrice) : activePoint.closePrice;

  return (
    <div className="w-full space-y-4">
      {/* Header Info & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {hoveredPoint ? formatDate(hoveredPoint.tradeDate) : `Giá đóng cửa ${symbol}`}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{formatVND(activeClose)}</span>
            <span className={`text-xs font-bold ${isPositiveChange ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositiveChange ? '▲' : '▼'} {(((lastPrice - firstPrice) / (firstPrice || 1)) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Range Selector */}
        {onRangeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                  activeRange.toLowerCase() === r
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox="0 0 500 180" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon points={areaString} fill={`url(#${gradientId})`} />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {prices.map((p, idx) => {
            const val = typeof p.closePrice === 'string' ? parseFloat(p.closePrice) : p.closePrice;
            const x = (idx / (prices.length - 1 || 1)) * 500;
            const y = 180 - ((val - minPrice) / priceRange) * 150;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3"
                className="fill-white stroke-2 cursor-pointer hover:r-5 transition-all"
                style={{ stroke: strokeColor }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
