import React from 'react';

export const LoadingSkeleton: React.FC<{ type?: 'card' | 'table' | 'chart' | 'text'; count?: number }> = ({
  type = 'card',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-full mb-4" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100">
            <div className="h-5 bg-slate-200 rounded-lg w-1/4" />
            <div className="h-5 bg-slate-200 rounded-lg w-1/4" />
            <div className="h-5 bg-slate-200 rounded-lg w-1/4" />
            <div className="h-5 bg-slate-200 rounded-lg w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-64 bg-slate-100 rounded-2xl p-6 border border-slate-200 animate-pulse flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="h-6 bg-slate-300 rounded-lg w-1/3" />
          <div className="h-6 bg-slate-300 rounded-lg w-1/5" />
        </div>
        <div className="h-32 bg-slate-200 rounded-xl w-full" />
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-4 bg-slate-200 rounded-md w-1/2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {items.map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-md w-1/3" />
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
          </div>
          <div className="h-8 bg-slate-300 rounded-lg w-1/2" />
          <div className="h-4 bg-slate-200 rounded-md w-2/3" />
        </div>
      ))}
    </div>
  );
};
