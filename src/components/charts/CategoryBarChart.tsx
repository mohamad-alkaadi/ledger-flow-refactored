import React, { useState } from 'react';
import { CategorySpending } from '../../types/expense';
import { DaySpending } from '../../services/expenseService';
import { BarChart3, AlertTriangle, Layers, Calendar } from 'lucide-react';

interface CategoryBarChartProps {
  categories: CategorySpending[];
  dailySpending: DaySpending[];
  dailyTarget: number;
  onSelectCategory: (cat: string | null) => void;
  selectedCategory: string | null;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categories,
  dailySpending,
  dailyTarget,
  onSelectCategory,
  selectedCategory,
}) => {
  const [viewMode, setViewMode] = useState<'budget_vs_actual' | 'daily_trend'>('budget_vs_actual');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Budget vs Actual Bar Chart Data
  const topCategories = categories
    .filter((c) => c.allocated > 0 || c.amount > 0)
    .slice(0, 8); // top 8 categories for clean readability

  const maxBudgetOrSpend = Math.max(
    ...topCategories.map((c) => Math.max(c.allocated, c.amount)),
    100
  );

  // 2. Daily Trend Bar Chart Data
  const maxDaily = Math.max(...dailySpending.map((d) => d.total), dailyTarget * 1.5, 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {viewMode === 'budget_vs_actual'
                ? 'Budget vs. Actual Spending'
                : 'Daily Spending Trend'}
            </h3>
            <p className="text-xs text-slate-500">
              {viewMode === 'budget_vs_actual'
                ? 'Allocated allowance vs realized expenses by category'
                : 'Day-by-day cash outflows against target allowance line'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setViewMode('budget_vs_actual');
              setHoveredIndex(null);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'budget_vs_actual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Budget vs Actual</span>
          </button>
          <button
            onClick={() => {
              setViewMode('daily_trend');
              setHoveredIndex(null);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'daily_trend'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Daily Velocity</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="py-4">
        {viewMode === 'budget_vs_actual' ? (
          /* View 1: Budget vs Actual */
          <div className="space-y-3.5">
            {topCategories.map((item, idx) => {
              const isOver = item.amount > item.allocated;
              const spendPercent =
                maxBudgetOrSpend > 0 ? (item.amount / maxBudgetOrSpend) * 100 : 0;
              const budgetPercent =
                maxBudgetOrSpend > 0 ? (item.allocated / maxBudgetOrSpend) * 100 : 0;
              const isSelected = selectedCategory === item.category;

              return (
                <div
                  key={item.category}
                  onClick={() =>
                    onSelectCategory(isSelected ? null : item.category)
                  }
                  className={`group p-2 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-800">
                        {item.category}
                      </span>
                      {isOver && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Over by{' '}
                          {formatCurrency(Math.abs(item.variance))}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
                      <span className="text-slate-500">
                        Budget: {formatCurrency(item.allocated)}
                      </span>
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        Spent: {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Representation */}
                  <div className="space-y-1">
                    {/* Spent Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : 'bg-slate-800'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, spendPercent))}%` }}
                      />
                    </div>
                    {/* Budget Target Guideline Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden opacity-60">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, budgetPercent))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Daily Spending Cadence Bar Chart */
          <div className="relative pt-6">
            {/* Target Allowance Guideline */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-amber-400 z-10 pointer-events-none flex items-center justify-between text-[11px] text-amber-700 font-mono"
              style={{
                bottom: `${(dailyTarget / maxDaily) * 160 + 24}px`,
              }}
            >
              <span className="bg-amber-50 px-1 py-0.5 rounded text-[10px] -translate-y-3 font-medium">
                Target: {formatCurrency(dailyTarget)}/day
              </span>
            </div>

            {/* SVG / Flex Bar Chart for Days */}
            <div className="flex items-end justify-between h-[180px] gap-1 px-1 border-b border-slate-200 pb-2">
              {dailySpending.map((dayData, i) => {
                const heightPercent =
                  maxDaily > 0 ? (dayData.total / maxDaily) * 100 : 0;
                const isHovered = hoveredIndex === i;
                const isAboveTarget = dayData.total > dailyTarget;

                return (
                  <div
                    key={dayData.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap z-30 pointer-events-none">
                        <div className="font-semibold">{dayData.dateStr}</div>
                        <div className="font-mono tabular-nums">
                          Total: {formatCurrency(dayData.total)}
                        </div>
                        <div className="text-slate-300 text-[10px]">
                          {dayData.count} transaction{dayData.count === 1 ? '' : 's'}
                        </div>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-200 ${
                        isHovered
                          ? 'bg-slate-900'
                          : isAboveTarget
                          ? 'bg-amber-500'
                          : dayData.total > 0
                          ? 'bg-slate-400'
                          : 'bg-slate-100'
                      }`}
                      style={{
                        height: `${Math.max(4, heightPercent)}%`,
                      }}
                    />

                    {/* Day label */}
                    <span className="text-[9px] text-slate-400 font-mono mt-1 select-none">
                      {dayData.day % 5 === 0 || dayData.day === 1 ? dayData.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Instructions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        {viewMode === 'budget_vs_actual' ? (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-slate-800" /> Actual Spend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-sm bg-slate-400" /> Target Budget
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-rose-500" /> Exceeded
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Normal Daily Spend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Exceeded Daily Allowance
            </span>
          </div>
        )}
        <span className="text-slate-400 font-mono text-[10px]">
          {viewMode === 'budget_vs_actual' ? 'Click category to filter table' : 'Hover for day detail'}
        </span>
      </div>
    </div>
  );
};
