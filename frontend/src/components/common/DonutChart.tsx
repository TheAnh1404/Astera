import React from 'react';
import { formatPercent, formatVND } from '@/utils/formatters';
import ReactApexChart from 'react-apexcharts';

export interface AllocationChartItem {
  symbol: string;
  name: string;
  weight: number; // e.g. 25 for 25% or 0.25
  amount?: number | string;
  color?: string;
}

interface DonutChartProps {
  items: AllocationChartItem[] ;
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
  // Normalize items & weights
  const totalRawWeight = items.reduce((acc, item) => {
    const w = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight;
    const finalW = isNaN(w) ? 0 : w;
    return acc + finalW;
  }, 0);

  const formattedItems = items.map((item, idx) => {
    const rawW = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight;
    const finalW = isNaN(rawW) ? 0 : rawW;
    return {
      ...item,
      normalizedWeight: finalW,
      color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    };
  });

  const series = formattedItems.map(item => item.normalizedWeight);
  
  const options: any = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      
    },
    labels: formattedItems.map(item => item.symbol),
    colors: formattedItems.map(item => item.color),
    stroke: { width: 2, colors: ['#ffffff'] },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '78%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontWeight: 800,
              color: '#94a3b8',
              offsetY: -12
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 900,
              color: '#0f172a',
              formatter: (val: number) => formatPercent(val),
              offsetY: -2
            },
            total: {
              show: true,
              showAlways: true,
              label: centerSublabel || 'Tổng phân bổ',
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              formatter: () => centerLabel || '100%'
            }
          }
        }
      }
    },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => formatPercent(val) }
    },
    legend: { show: false }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      {/* ApexChart Donut */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <ReactApexChart options={options} series={series} type="donut" width={size} height={size} />
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {formattedItems.map((item, idx) => {
          return (
            <div
              key={item.symbol || idx}
              className="p-2.5 rounded-xl border transition-all flex items-center justify-between bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
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
