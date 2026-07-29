import React, { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  disclaimerText?: string;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  disclaimerText = 'Estimated allocation for simulation and decision support only.',
}) => {
  const [isAccepted, setIsAccepted] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isAccepted && !isSubmitting) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Xác nhận Tuyên bố Miễn trừ Trách nhiệm
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Vui lòng đọc kỹ trước khi khởi tạo danh mục đầu tư
              </p>
            </div>
          </div>

          {/* Disclaimer Text Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
            <p className="font-semibold text-slate-900">Ghi chú quan trọng:</p>
            <p>• {disclaimerText}</p>
            <p>
              • Danh mục được gợi ý tự động bằng mô hình AI Wealth4ward dựa trên phân tích chế độ thị trường (Market Regime) và hồ sơ rủi ro của bạn.
            </p>
            <p>
              • Đây là hệ thống hỗ trợ quyết định mô phỏng. Kết quả trong quá khứ không đảm bảo hiệu suất lợi nhuận trong tương lai.
            </p>
          </div>

          {/* Mandatory Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-0.5 w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug group-hover:text-slate-900">
              Tôi hiểu đây là danh mục mô phỏng và không đảm bảo lợi nhuận.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isAccepted || isSubmitting}
              className="btn-primary text-white text-xs font-bold px-7 py-3 rounded-full flex items-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác nhận & Tạo danh mục</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
