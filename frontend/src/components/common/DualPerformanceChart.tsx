import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ChevronDown } from 'lucide-react';

const formatPnL = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return {
    text: `${sign}${Math.abs(value).toLocaleString('vi-VN')} VNĐ`,
    isPositive: value >= 0,
  };
};

interface DualPerformanceChartProps {
  activeFilter: string;
  onFilterChange: (f: string) => void;
  compareBenchmark: string;
  onBenchmarkChange: (b: string) => void;
  data?: any[];
  metrics?: {
    totalProfit: number;
    totalProfitPercent: number;
    monthProfit: number;
    dayProfit: number;
  };
}

export const DualPerformanceChart: React.FC<DualPerformanceChartProps> = ({ 
  activeFilter, 
  onFilterChange, 
  compareBenchmark, 
  onBenchmarkChange, 
  data, 
  metrics 
}) => {
  const filters = ['1M', '3M', '6M', '1Y', 'ALL'];

  const chartData = data || [
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

  const series = [
    {
      name: 'Danh mục',
      data: chartData.map((d: any) => {
        let ts = new Date().getTime();
        if (d.date.includes('/')) {
            const [day, month] = d.date.split('/');
            ts = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day)).getTime();
        } else {
            ts = new Date(d.date).getTime();
        }
        return [ts, d.portfolio];
      })
    },
    {
      name: compareBenchmark,
      data: chartData.map((d: any) => {
        let ts = new Date().getTime();
        if (d.date.includes('/')) {
            const [day, month] = d.date.split('/');
            ts = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day)).getTime();
        } else {
            ts = new Date(d.date).getTime();
        }
        return [ts, d.benchmark];
      })
    }
  ];

  const options: any = {
    chart: {
      type: 'area',
      height: 250,
      toolbar: { autoSelected: 'zoom' },
      fontFamily: 'inherit',
      animations: { enabled: true }
    },
    colors: ['#10b981', '#3b82f6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      type: 'datetime',
      labels: { datetimeFormatter: { year: 'yyyy', month: "MMM 'yy", day: 'dd/MM' } }
    },
    yaxis: {
      labels: { formatter: (val: number) => val.toFixed(2) + '%' }
    },
    tooltip: {
      x: { format: 'dd/MM/yyyy' }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    legend: { show: false }
  };

  const lastPoint = chartData[chartData.length - 1] || { portfolio: 0, benchmark: 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Danh mục của bạn</span>
            <span className="text-emerald-600 font-extrabold">{lastPoint.portfolio > 0 ? '+' : ''}{lastPoint.portfolio}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600">{compareBenchmark}</span>
            <span className="text-blue-600 font-extrabold">{lastPoint.benchmark > 0 ? '+' : ''}{lastPoint.benchmark}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
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

          <div className="relative">
            <select
              value={compareBenchmark}
              onChange={(e) => onBenchmarkChange(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border-none cursor-pointer outline-none transition-colors"
            >
              <option value="VN-Index">So sánh với VN-Index</option>
              <option value="VN30">So sánh với VN30</option>
              <option value="HNX-Index">So sánh với HNX-Index</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="w-full pt-2">
        <ReactApexChart options={options} series={series} type="area" height={250} />
      </div>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng lợi nhuận</div>
            <div className={`text-sm font-black ${metrics.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatPnL(metrics.totalProfit).text}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiệu suất</div>
            <div className={`text-sm font-black ${metrics.totalProfitPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.totalProfitPercent >= 0 ? '+' : ''}{metrics.totalProfitPercent.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lợi nhuận tháng</div>
            <div className={`text-sm font-black ${metrics.monthProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatPnL(metrics.monthProfit).text}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lợi nhuận ngày</div>
            <div className={`text-sm font-black ${metrics.dayProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatPnL(metrics.dayProfit).text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
