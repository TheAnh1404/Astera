import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">500</h1>
          <h3 className="text-lg font-extrabold text-slate-800">Lỗi Máy chủ</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Hệ thống đang gặp sự cố gián đoạn tạm thời. Vui lòng thử lại sau ít phút.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="btn-primary text-white text-xs font-bold px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Trang chủ Wealth4ward</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
