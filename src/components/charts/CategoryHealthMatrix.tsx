import React, { useState } from 'react';
import { CategorySpending, Transaction } from '../../types/expense';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react';

interface CategoryHealthMatrixProps {
  categories: CategorySpending[];
  transactions: Transaction[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onOpenBudgetModal: () => void;
  onViewInTransactions: (cat: string) => void;
}

export const CategoryHealthMatrix: React.FC<CategoryHealthMatrixProps> = ({
  categories,
  transactions,
  selectedCategory,
  onSelectCategory,
  onOpenBudgetModal,
  onViewInTransactions,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'over' | 'warning' | 'safe'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Determine active inspected category (either selected or top spender)
  const activeCategory =
    categories.find((c) => c.category === selectedCategory) ||
    categories[0] ||
    null;

  // Transactions specific to the active category
  const activeCategoryTransactions = activeCategory
    ? transactions
        .filter((t) => t.category === activeCategory.category && t.type === 'expense')
        .slice(0, 4)
    : [];

  // Filter categories by health status
  const filteredCategories = categories.filter((cat) => {
    if (cat.allocated <= 0 && cat.amount <= 0) return false;
    const ratio = cat.allocated > 0 ? (cat.amount / cat.allocated) * 100 : 0;
    if (filterStatus === 'over') return ratio > 100;
    if (filterStatus === 'warning') return ratio >= 80 && ratio <= 100;
    if (filterStatus === 'safe') return ratio < 80;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Category Health & Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Interactive allocation audit, utilization gauges, and transaction drilldown
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('over')}
            className={`px-2 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              filterStatus === 'over'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Over Limit
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-2 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              filterStatus === 'warning'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Near Limit
          </button>
          <button
            onClick={() => setFilterStatus('safe')}
            className={`px-2 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              filterStatus === 'safe'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safe
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Category Status List (5 cols) */}
        <div className="md:col-span-6 space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No categories match the status filter.
            </div>
          ) : (
            filteredCategories.map((item) => {
              const isSelected = activeCategory?.category === item.category;
              const ratio =
                item.allocated > 0 ? (item.amount / item.allocated) * 100 : 0;
              const isOver = ratio > 100;
              const isNear = ratio >= 80 && ratio <= 100;

              return (
                <button
                  key={item.category}
                  onClick={() => onSelectCategory(item.category)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold truncate">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-xs">
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? isOver
                              ? 'bg-rose-900/80 text-rose-200'
                              : 'bg-slate-800 text-slate-200'
                            : isOver
                            ? 'bg-rose-100 text-rose-700'
                            : isNear
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ratio.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className={`w-full rounded-full h-1.5 overflow-hidden ${
                      isSelected ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : isNear
                          ? 'bg-amber-500'
                          : isSelected
                          ? 'bg-emerald-400'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Category Detailed Inspector (7 cols) */}
        <div className="md:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          {activeCategory ? (
            <div className="space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: activeCategory.color }}
                    />
                    <h4 className="text-sm font-bold text-slate-900">
                      {activeCategory.category}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeCategory.count} transaction{activeCategory.count === 1 ? '' : 's'} recorded this cycle
                  </p>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    activeCategory.amount > activeCategory.allocated
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {activeCategory.amount > activeCategory.allocated ? (
                    <>
                      <AlertTriangle className="w-3 h-3" /> Over Budget
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Safe Target
                    </>
                  )}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    Actual Spent
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {formatCurrency(activeCategory.amount)}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    Allocated Target
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {formatCurrency(activeCategory.allocated)}
                  </span>
                </div>
              </div>

              {/* Recent Category Transactions */}
              <div>
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Recent {activeCategory.category} Charges
                </span>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                  {activeCategoryTransactions.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">
                      No charges logged this month
                    </div>
                  ) : (
                    activeCategoryTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-1.5 bg-white border border-slate-200/70 rounded-md flex items-center justify-between text-[11px]"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-slate-800 truncate block">
                            {tx.merchant}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tx.date}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-semibold text-slate-900 shrink-0">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onViewInTransactions(activeCategory.category)}
                  className="text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter ledger for this category</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={onOpenBudgetModal}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Edit limit
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              Select a category on the left to inspect its budget health.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any category above to inspect its real-time ledger health</span>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-slate-700 hover:underline font-medium cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};
