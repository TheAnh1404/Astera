import React, { useState, useEffect } from 'react';
import { Layers, Activity, Calendar, PieChart } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { DonutChart } from '@/components/common/DonutChart';

// Define the shape of our historical allocation records
interface AllocationItem {
  ma_co_phieu: string;
  so_lo: number;
  so_co_phieu: number;
  gia_hien_tai: number;
  so_tien_chi: number;
  ty_trong_goc_ppo: number;
  ty_trong_thuc_te: number;
}

interface HistoricalRecord {
  date: string;
  capital: number;
  used_capital: number;
  cash_left: number;
  tracking_error?: number;
  warning_flag?: boolean;
  warning_msg?: string;
  allocations: AllocationItem[];
}

export const PublicPortfolioPage: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoricalRecord[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [capitalInput, setCapitalInput] = useState<number>(1000000000);

  // Fetch the historical records directly from the public history.json
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/history.json');
        if (!response.ok) throw new Error('Cannot fetch history');
        const data: HistoricalRecord[] = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setHistoryData(data);
          setSelectedDateIndex(data.length - 1); // Select the latest date by default
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const selectedRecord = historyData[selectedDateIndex] || null;

  // Tự động tính toán lại số lô, số cổ phiếu, tiền chi dựa trên mức vốn người dùng chọn
  const dynamicAllocations = selectedRecord ? selectedRecord.allocations.map(alloc => {
    const tyTrong = alloc.ty_trong_goc_ppo ?? alloc.ty_trong_thuc_te;
    const targetCash = capitalInput * tyTrong;
    const targetLots = Math.floor(targetCash / (alloc.gia_hien_tai * 100));
    const so_co_phieu = targetLots * 100;
    const so_tien_chi = so_co_phieu * alloc.gia_hien_tai;
    return {
      ...alloc,
      so_co_phieu,
      so_tien_chi,
      ty_trong_thuc_te: so_tien_chi / capitalInput
    };
  }) : [];

  const dynamicUsedCapital = dynamicAllocations.reduce((sum, item) => sum + item.so_tien_chi, 0);
  const dynamicCashLeft = capitalInput - dynamicUsedCapital;

  const donutItems = dynamicAllocations.map(alloc => ({
    symbol: alloc.ma_co_phieu,
    name: alloc.ma_co_phieu,
    weight: alloc.ty_trong_thuc_te * 100,
    amount: alloc.so_tien_chi,
  }));
  if (dynamicCashLeft > 0) {
    donutItems.push({
      symbol: 'TIỀN MẶT',
      name: 'Tiền mặt',
      weight: (dynamicCashLeft / capitalInput) * 100,
      amount: dynamicCashLeft,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header 
        onOpenAssessment={() => {}} 
        onOpenLiveDemo={() => window.location.href = '/live-demo'} 
      />

      <main className="flex-grow flex flex-col items-center py-10 px-4 mt-12">
        <div className="w-full max-w-6xl space-y-6">
          
          {/* Page Title & Intro */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
              <PieChart className="w-8 h-8 text-blue-600" />
              Phân Bổ Danh Mục AI
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Xem chi tiết cơ cấu danh mục và tỷ trọng phân bổ cổ phiếu do mô hình Trí Tuệ Nhân Tạo tính toán qua từng mốc thời gian thực tế.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-blue-600 space-y-4">
              <Activity className="w-10 h-10 animate-spin" />
              <p className="font-bold text-slate-500">Đang nạp dữ liệu lịch sử...</p>
            </div>
          ) : !selectedRecord ? (
            <div className="text-center py-20 text-slate-500 font-medium">
              Không có dữ liệu lịch sử để hiển thị.
            </div>
          ) : (
            <>
              {/* Controls Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Date Selector */}
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Mốc Thời Gian (Phiên Giao Dịch)
                  </h3>
                  <select 
                    className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none hover:bg-slate-100 focus:border-blue-500 transition-all cursor-pointer"
                    value={selectedDateIndex}
                    onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
                  >
                    {historyData.map((record, index) => (
                      <option key={record.date} value={index}>
                        Ngày: {record.date}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capital Selector */}
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Mô Phỏng Vốn Đầu Tư
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {[100000000, 500000000, 1000000000].map((val) => (
                        <button
                          key={val}
                          onClick={() => setCapitalInput(val)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                            capitalInput === val
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {(val / 1000000).toLocaleString('vi-VN')} Tr
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full sm:w-auto flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">VNĐ</span>
                      <input
                        type="text"
                        value={capitalInput ? capitalInput.toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          setCapitalInput(Number(rawValue));
                        }}
                        className="w-full text-right bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-10 pr-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="Nhập vốn..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Vốn Mô Phỏng</p>
                    <p className="text-2xl font-black text-slate-900">{capitalInput.toLocaleString('vi-VN')} <span className="text-sm font-bold text-slate-500">VNĐ</span></p>
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">Vốn Phân Bổ (Cổ Phiếu)</p>
                    <p className="text-2xl font-black text-emerald-600">{dynamicUsedCapital.toLocaleString('vi-VN')} <span className="text-sm font-bold text-emerald-500">VNĐ</span></p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <PieChart className="w-24 h-24 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider">Tiền Mặt Khả Dụng</p>
                    <p className="text-2xl font-black text-blue-600">{dynamicCashLeft.toLocaleString('vi-VN')} <span className="text-sm font-bold text-blue-500">VNĐ</span></p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Layers className="w-24 h-24 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Main Dashboard UI Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Donut Chart + Summary */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-slate-900">Phân bổ danh mục</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                          {selectedRecord.date}
                        </span>
                      </div>
                    </div>

                    <DonutChart
                      items={donutItems}
                      centerLabel={capitalInput >= 1e9 ? `${(capitalInput / 1e9).toFixed(2)}B` : capitalInput >= 1e6 ? `${(capitalInput / 1e6).toFixed(1)}M` : capitalInput.toLocaleString('vi-VN')}
                      centerSublabel="Tổng Vốn"
                    />
                  </div>
                </div>

                {/* Right Side: Table View */}
                <div className="lg:col-span-8 bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Chi Tiết Cổ Phiếu</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                          <th className="py-2.5 px-4">Mã CP</th>
                          <th className="py-2.5 px-4 text-right">Số Lượng</th>
                          <th className="py-2.5 px-4 text-right">Giá Cổ Phiếu</th>
                          <th className="py-2.5 px-4 text-right">Vốn Phân Bổ</th>
                          <th className="py-2.5 px-4 text-right">Tỷ Trọng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                        {dynamicAllocations && dynamicAllocations.length > 0 ? (
                          [...dynamicAllocations]
                            .sort((a, b) => b.ty_trong_thuc_te - a.ty_trong_thuc_te)
                            .map((item, idx) => (
                            <tr key={item.ma_co_phieu} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-black text-blue-600 flex items-center gap-2">
                                {item.ma_co_phieu}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-slate-700">
                                {item.so_co_phieu.toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-slate-500">
                                {item.gia_hien_tai.toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {item.so_tien_chi.toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-black text-[10px]">
                                  {(item.ty_trong_thuc_te * 100).toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400">
                              Danh mục trống.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
