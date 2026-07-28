import React from 'react';
import { Activity, Calendar, Cpu } from 'lucide-react';
import type { MarketRegimeView } from '@/types/api';
import { formatDate } from '@/utils/formatters';
import { MarketRegimeBadge } from './MarketRegimeBadge';

interface LiveDemoPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  regime?: MarketRegimeView | null;
  actions?: React.ReactNode;
  dataLabel?: string;
}

/**
 * Shared page banner inspired by the Live Demo console. It keeps the visual
 * language consistent while exposing only real API state on authenticated pages.
 */
export const LiveDemoPageHeader: React.FC<LiveDemoPageHeaderProps> = ({
  eyebrow = 'ASTERA AI INVESTMENT CONSOLE',
  title,
  description,
  regime,
  actions,
  dataLabel = 'Dữ liệu thị trường gần nhất',
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-5 md:px-7 md:py-6 text-white shadow-xl shadow-slate-900/10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              <span>AI Brain Engine Active</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>{eyebrow}</span>
          </div>

          <h2 className="truncate text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
          <p className="max-w-3xl text-xs font-medium leading-relaxed text-slate-300 md:text-sm">{description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] font-semibold text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-300" />
              <span>{dataLabel}:</span>
              <span className="font-black text-slate-200">{formatDate(regime?.dataDate || regime?.detectedAt)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              <span>Model:</span>
              <span className="font-black text-slate-200">{regime?.modelVersion || 'Astera HMM Core'}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {regime && <MarketRegimeBadge code={regime.code} size="md" />}
          {!regime && (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-bold text-slate-300">
              <Cpu className="h-3.5 w-3.5" />
              Đang đồng bộ tín hiệu
            </span>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </section>
  );
};
