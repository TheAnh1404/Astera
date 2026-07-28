import React, { useState } from 'react';
import { formatPercent, formatVND } from '@/utils/formatters';

export interface AllocationChartItem {
  symbol: string;
  name: string;
  weight: number; // e.g. 25 for 25% or 0.25
  amount?: number | string;
  color?: string;
}

interface DonutChartProps {
  items: AllocationChartItem[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

export const DonutChart: React.FC<DonutChartProps> = ({
  items,
  centerLabel,
  centerSublabel = 'Tổng phân bổ',
  size = 220,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Normalize items & weights
  const totalRawWeight = items.reduce((acc, item) => {
    const w = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight;
    const normW = Math.abs(w) <= 1 && w !== 0 ? w * 100 : w;
    return acc + (isNaN(normW) ? 0 : normW);
  }, 0);

  const formattedItems = items.map((item, idx) => {
    const rawW = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight;
    const normW = Math.abs(rawW) <= 1 && rawW !== 0 ? rawW * 100 : rawW;
    const finalW = isNaN(normW) ? 0 : normW;
    return {
      ...item,
      normalizedWeight: finalW,
      color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    };
  });

  // Calculate SVG arc paths
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {formattedItems.map((item, idx) => {
            const pct = totalRawWeight > 0 ? item.normalizedWeight / totalRawWeight : 0;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;

            const isHovered = activeIndex === idx;

            return (
              <circle
                key={item.symbol || idx}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center overlay label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          {activeIndex !== null ? (
            <>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {formattedItems[activeIndex].symbol}
              </span>
              <span className="text-xl font-black text-slate-900">
                {formatPercent(formattedItems[activeIndex].normalizedWeight)}
              </span>
              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                {formattedItems[activeIndex].name}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {centerSublabel}
              </span>
              <span className="text-2xl font-black text-slate-900">
                {centerLabel ? centerLabel : `${totalRawWeight.toFixed(0)}%`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {formattedItems.map((item, idx) => {
          const isHovered = activeIndex === idx;
          return (
            <div
              key={item.symbol || idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isHovered
                  ? 'bg-slate-50 border-slate-300 shadow-sm translate-x-1'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {item.symbol}{' '}
                    <span className="font-normal text-xs text-slate-500">
                      ({item.name})
                    </span>
                  </div>
                  {item.amount !== undefined && (
                    <div className="text-xs font-medium text-slate-400">
                      {formatVND(item.amount)}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-slate-900">
                  {formatPercent(item.normalizedWeight)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
