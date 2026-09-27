import React from 'react';
import { CategorySpending, DashboardMetrics } from '../types/expense';
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface CategoryAnalyticsCardsProps {
  categories: CategorySpending[];
  metrics: DashboardMetrics;
  onOpenBudgetModal: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

const ESSENTIAL_CATEGORIES = new Set([
  'Housing & Rent',
  'Food & Groceries',
  'Utilities & Bills',
  'Healthcare & Wellness',
  'Transportation',
]);

export const CategoryAnalyticsCards: React.FC<CategoryAnalyticsCardsProps> = ({
  categories,
  metrics,
  onOpenBudgetModal,
  onSelectCategory,
  selectedCategory,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeCategories = categories.filter((c) => c.amount > 0);
  const overBudgetCategories = categories.filter((c) => c.amount > c.allocated && c.allocated > 0);
  const onTrackCategories = categories.filter((c) => c.amount <= c.allocated && c.allocated > 0);

  const totalOverSpend = overBudgetCategories.reduce(
    (sum, c) => sum + (c.amount - c.allocated),
    0
  );

  // Top 3 Concentration
  const top3 = categories.slice(0, 3);
  const top3Total = top3.reduce((sum, c) => sum + c.amount, 0);
  const top3Share = metrics.totalExpenses > 0 ? (top3Total / metrics.totalExpenses) * 100 : 0;

  // Essential vs Discretionary Split
  let essentialTotal = 0;
  let discretionaryTotal = 0;
  categories.forEach((c) => {
    if (ESSENTIAL_CATEGORIES.has(c.category)) {
      essentialTotal += c.amount;
    } else {
      discretionaryTotal += c.amount;
    }
  });

  const essentialPercent =
    metrics.totalExpenses > 0 ? (essentialTotal / metrics.totalExpenses) * 100 : 0;
  const discretionaryPercent =
    metrics.totalExpenses > 0 ? (discretionaryTotal / metrics.totalExpenses) * 100 : 0;

  const topCategory = categories[0] || null;

  return (
    <div className="space-y-4">
      {/* Category Analytics Top Section Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Category Spending & Allocation Analytics
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-violet-100 text-violet-800 rounded-md">
                Distribution View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Audit budget variance, spending concentration, and category risk factors across this cycle
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Adjust Category Targets</span>
        </button>
      </div>

      {/* 4 Specialized Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Concentration & Top Driver */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Top Expense Driver</span>
              <Layers className="w-4 h-4 text-violet-500" />
            </div>
            {topCategory ? (
              <div>
                <div className="text-xl font-bold tracking-tight text-slate-900 truncate">
                  {topCategory.category}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(topCategory.amount)}
                  </span>
                  <span className="text-xs font-mono font-medium text-violet-700">
                    {topCategory.percentage.toFixed(1)}% of spend
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-400">No expenses recorded</span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Top 3 categories:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {top3Share.toFixed(0)}% concentration
            </span>
          </div>
        </div>

        {/* Card 2: Budget Variance & Overspend Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Category Adherence</span>
              {overBudgetCategories.length > 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
                  overBudgetCategories.length > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {overBudgetCategories.length > 0
                  ? `${overBudgetCategories.length} Over Budget`
                  : 'All on Track'}
              </span>
            </div>
            <div className="mt-1.5 text-xs text-slate-500">
              {overBudgetCategories.length > 0 ? (
                <span>
                  Exceeded allocations by{' '}
                  <strong className="text-rose-600 font-mono">
                    {formatCurrency(totalOverSpend)}
                  </strong>
                </span>
              ) : (
                <span>
                  {onTrackCategories.length} categories within planned targets
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500">Safe Categories</span>
            <span className="font-mono tabular-nums font-medium text-emerald-700">
              {onTrackCategories.length} / {categories.length}
            </span>
          </div>
        </div>

        {/* Card 3: Essential vs Discretionary Split */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Needs vs. Wants Ratio</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {essentialPercent.toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500">Essential needs</span>
            </div>

            {/* Split Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className="h-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${essentialPercent}%` }}
                  title={`Essential: ${formatCurrency(essentialTotal)}`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${discretionaryPercent}%` }}
                  title={`Discretionary: ${formatCurrency(discretionaryTotal)}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Discretionary:</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {formatCurrency(discretionaryTotal)} ({discretionaryPercent.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Card 4: Active Footprint & Average Allocation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Active Categories</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {activeCategories.length}
              </span>
              <span className="text-xs text-slate-500">
                of {categories.length} configured
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Avg spent per active bucket:{' '}
              <strong className="text-slate-800 font-mono">
                {formatCurrency(
                  activeCategories.length > 0
                    ? metrics.totalExpenses / activeCategories.length
                    : 0
                )}
              </strong>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span>Filtered:</span>
            {selectedCategory ? (
              <span className="text-slate-900 font-medium truncate max-w-[120px]">
                {selectedCategory}
              </span>
            ) : (
              <span className="text-slate-400">All categories</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
