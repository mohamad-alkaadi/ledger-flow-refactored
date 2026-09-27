import React, { useState, useEffect } from 'react';
import { ExpenseCategory, MonthlyBudgetConfig } from '../types/expense';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_BUDGETS } from '../data/mockData';
import { X, DollarSign, Sliders, Check, RotateCcw } from 'lucide-react';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: MonthlyBudgetConfig;
  onSaveBudget: (budget: MonthlyBudgetConfig) => void;
  monthName: string;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
  monthName,
}) => {
  const [totalBudget, setTotalBudget] = useState(currentBudget.totalBudget.toString());
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(
    currentBudget.categoryBudgets
  );

  useEffect(() => {
    setTotalBudget(currentBudget.totalBudget.toString());
    setCategoryBudgets({ ...currentBudget.categoryBudgets });
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: Math.max(0, num),
    }));
  };

  const handleResetDefaults = () => {
    const defaultMap: Record<string, number> = {};
    DEFAULT_CATEGORY_BUDGETS.forEach((b) => {
      defaultMap[b.category] = b.allocated;
    });
    setCategoryBudgets(defaultMap);
    setTotalBudget('4500');
  };

  const sumCategories = Object.values(categoryBudgets).reduce((sum, v) => sum + v, 0);
  const parsedTotal = parseFloat(totalBudget) || 0;
  const unallocated = parsedTotal - sumCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget({
      month: currentBudget.month,
      totalBudget: parsedTotal,
      categoryBudgets,
    });
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <span>Budget Plan — {monthName}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Customize overall monthly spending target and category allocations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Total Budget Target */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Total Monthly Expense Limit ($)
            </label>
            <div className="relative max-w-xs">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                step="50"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base font-bold font-mono tabular-nums text-slate-900 bg-white border border-slate-300 focus:border-slate-800 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-500">
                Sum of categories: {formatCurrency(sumCategories)}
              </span>
              <span
                className={`font-semibold ${
                  unallocated >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {unallocated >= 0
                  ? `${formatCurrency(unallocated)} unallocated buffer`
                  : `${formatCurrency(Math.abs(unallocated))} over total limit`}
              </span>
            </div>
          </div>

          {/* Category Budgets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Category Allocations
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(CATEGORY_COLORS)
                .filter((cat) => cat !== 'Income & Salary')
                .map((category) => {
                  const currentAllocated = categoryBudgets[category] || 0;
                  const catColor = CATEGORY_COLORS[category as ExpenseCategory]?.color || '#64748b';
                  const percentOfTotal =
                    parsedTotal > 0 ? (currentAllocated / parsedTotal) * 100 : 0;

                  return (
                    <div
                      key={category}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          <span className="text-xs font-medium text-slate-800 truncate">
                            {category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {percentOfTotal.toFixed(0)}% of budget
                        </span>
                      </div>

                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={currentAllocated}
                          onChange={(e) =>
                            handleCategoryChange(category, e.target.value)
                          }
                          className="w-full pl-6 pr-2 py-1 text-xs font-mono tabular-nums text-right text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Budget Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
