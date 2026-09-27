import React from 'react';
import { CategorySpending } from '../types/expense';
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface CategoryAnalyticsBreakdownProps {
  categories: CategorySpending[];
  totalExpenses: number;
  onSelectCategory: (category: string) => void;
  onOpenBudgetModal: () => void;
}

export const CategoryAnalyticsBreakdown: React.FC<CategoryAnalyticsBreakdownProps> = ({
  categories,
  totalExpenses,
  onSelectCategory,
  onOpenBudgetModal,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Category Spending & Budget Variance
          </h3>
          <p className="text-xs text-slate-500">
            Comprehensive audit of realized costs against target allocations
          </p>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <span>Modify Category Targets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              <th className="py-2.5 px-4 sm:px-6">Category</th>
              <th className="py-2.5 px-4 text-right">Actual Spent</th>
              <th className="py-2.5 px-4 text-right">Target Budget</th>
              <th className="py-2.5 px-4 text-right">Budget Variance</th>
              <th className="py-2.5 px-4 text-right hidden sm:table-cell">Share of Spend</th>
              <th className="py-2.5 px-4 sm:px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {categories.map((cat) => {
              const isOver = cat.amount > cat.allocated;
              const usedPercent =
                cat.allocated > 0 ? (cat.amount / cat.allocated) * 100 : 0;

              return (
                <tr
                  key={cat.category}
                  onClick={() => onSelectCategory(cat.category)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-900 group-hover:underline">
                        {cat.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({cat.count} tx)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(cat.amount)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums text-slate-500">
                    {formatCurrency(cat.allocated)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isOver ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOver ? (
                        <TrendingUp className="w-3 h-3 text-rose-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                      )}
                      {isOver ? '+' : '-'}
                      {formatCurrency(Math.abs(cat.variance))}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums hidden sm:table-cell text-slate-600">
                    {cat.percentage.toFixed(1)}%
                  </td>

                  <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Over ({usedPercent.toFixed(0)}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>On track ({usedPercent.toFixed(0)}%)</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
