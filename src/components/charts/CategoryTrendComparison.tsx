import React, { useState } from 'react';
import { CategoryMultiMonthTrend } from '../../services/expenseService';
import { BarChart2, TrendingUp, TrendingDown, Layers, ArrowUpDown } from 'lucide-react';

interface CategoryTrendComparisonProps {
  trendsData: {
    trends: CategoryMultiMonthTrend[];
    currentMonthLabel: string;
    prevMonthLabel: string;
    priorMonthLabel: string;
  };
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryTrendComparison: React.FC<CategoryTrendComparisonProps> = ({
  trendsData,
  selectedCategory,
  onSelectCategory,
}) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'mom_delta'>('grouped');

  const { trends, currentMonthLabel, prevMonthLabel, priorMonthLabel } = trendsData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Top 7 categories for clean readability
  const displayedTrends = trends.slice(0, 7);

  // Maximum value across months for scale
  const maxMonthValue = Math.max(
    ...displayedTrends.map((t) =>
      Math.max(t.currentAmount, t.prevAmount, t.priorAmount)
    ),
    100
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {viewMode === 'grouped'
                ? 'Multi-Month Category Velocity'
                : 'Month-over-Month Spending Shift'}
            </h3>
            <p className="text-xs text-slate-500">
              {viewMode === 'grouped'
                ? `Compare category spending across ${priorMonthLabel}, ${prevMonthLabel}, and ${currentMonthLabel}`
                : `Net dollar and percentage change relative to ${prevMonthLabel}`}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grouped')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>3-Month Compare</span>
          </button>
          <button
            onClick={() => setViewMode('mom_delta')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'mom_delta'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>MoM Shift (%)</span>
          </button>
        </div>
      </div>

      {/* Main Visual Content */}
      <div className="py-4">
        {viewMode === 'grouped' ? (
          /* View 1: 3-Month Grouped Comparison */
          <div className="space-y-4">
            {displayedTrends.map((item) => {
              const isSelected = selectedCategory === item.category;

              const curPercent = (item.currentAmount / maxMonthValue) * 100;
              const prevPercent = (item.prevAmount / maxMonthValue) * 100;
              const priorPercent = (item.priorAmount / maxMonthValue) * 100;

              return (
                <div
                  key={item.category}
                  onClick={() =>
                    onSelectCategory(isSelected ? null : item.category)
                  }
                  className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
                      <span className="text-slate-400">
                        {priorMonthLabel}: {formatCurrency(item.priorAmount)}
                      </span>
                      <span className="text-slate-500">
                        {prevMonthLabel}: {formatCurrency(item.prevAmount)}
                      </span>
                      <span className="font-bold text-slate-900">
                        {currentMonthLabel}: {formatCurrency(item.currentAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 3 Grouped Bars */}
                  <div className="space-y-1">
                    {/* Current Month Bar (Solid Slate 900) */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, curPercent))}%` }}
                        title={`${currentMonthLabel}: ${formatCurrency(item.currentAmount)}`}
                      />
                    </div>

                    {/* Previous Month Bar (Slate 500) */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, prevPercent))}%` }}
                        title={`${prevMonthLabel}: ${formatCurrency(item.prevAmount)}`}
                      />
                    </div>

                    {/* Prior Month Bar (Slate 300) */}
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full bg-slate-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, priorPercent))}%` }}
                        title={`${priorMonthLabel}: ${formatCurrency(item.priorAmount)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Month-over-Month Delta Shift */
          <div className="space-y-3">
            {displayedTrends.map((item) => {
              const isSelected = selectedCategory === item.category;
              const hasIncreased = item.momDelta > 0;
              const isFlat = item.momDelta === 0;

              return (
                <div
                  key={item.category}
                  onClick={() =>
                    onSelectCategory(isSelected ? null : item.category)
                  }
                  className={`p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 text-xs block truncate">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {prevMonthLabel}: {formatCurrency(item.prevAmount)} → {currentMonthLabel}: {formatCurrency(item.currentAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-right">
                    <span className="text-xs text-slate-600">
                      {hasIncreased ? '+' : ''}
                      {formatCurrency(item.momDelta)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isFlat
                          ? 'bg-slate-100 text-slate-600'
                          : hasIncreased
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {hasIncreased ? (
                        <TrendingUp className="w-3 h-3 text-rose-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>
                        {hasIncreased ? '+' : ''}
                        {item.momDeltaPercent.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        {viewMode === 'grouped' ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-800">
              <span className="w-3 h-2 rounded-sm bg-slate-900" /> {currentMonthLabel} (Current)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-1.5 rounded-sm bg-slate-400" /> {prevMonthLabel}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-1 rounded-sm bg-slate-300" /> {priorMonthLabel}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <TrendingUp className="w-3 h-3" /> Spend Increased
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <TrendingDown className="w-3 h-3" /> Reduced Spend
            </span>
          </div>
        )}

        <span className="text-slate-400 font-mono text-[10px]">
          Click category to focus
        </span>
      </div>
    </div>
  );
};
