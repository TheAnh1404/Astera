import React, { useState } from 'react';
import { formatDate, formatVND } from '@/utils/formatters';

export interface PerformancePoint {
  date: string;
  value: number;
  capital?: number;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
  initialCapital?: number;
  height?: number;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  initialCapital,
  height = 260,
  onFilterChange,
  activeFilter = '1M',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PerformancePoint | null>(null);

  const filters = ['1M', '3M', '6M', '1Y', 'ALL'];

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
        Chưa có đủ dữ liệu lịch sử hiệu suất danh mục.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;
  const valRange = maxVal - minVal || 1;

  // Generate SVG path points
  const pointsString = data
    .map((d, idx) => {
      const x = (idx / (data.length - 1 || 1)) * 500;
      const y = 180 - ((d.value - minVal) / valRange) * 150;
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `0,180 ${pointsString} 500,180`;

  return (
    <div className="w-full space-y-4">
      {/* Header controls & stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {hoveredPoint ? formatDate(hoveredPoint.date) : 'Giá trị danh mục'}
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatVND(hoveredPoint ? hoveredPoint.value : data[data.length - 1]?.value)}
          </div>
        </div>

        {/* Time range filters */}
        {onFilterChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeFilter === f
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Area Line Chart */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox="0 0 500 180" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#316bf3" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#316bf3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Capital Reference Line */}
          {initialCapital && (
            <line
              x1="0"
              y1={180 - ((initialCapital - minVal) / valRange) * 150}
              x2="500"
              y2={180 - ((initialCapital - minVal) / valRange) * 150}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Area Fill */}
          <polygon points={areaString} fill="url(#perfGradient)" />

          {/* Stroke Line */}
          <polyline
            fill="none"
            stroke="#316bf3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Interactive Data Points */}
          {data.map((d, idx) => {
            const x = (idx / (data.length - 1 || 1)) * 500;
            const y = 180 - ((d.value - minVal) / valRange) * 150;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="4"
                className="fill-blue-600 stroke-white stroke-2 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
