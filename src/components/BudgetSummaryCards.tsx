import React from 'react';
import { DashboardMetrics } from '../types/expense';
import {
  TrendingDown,
  TrendingUp,
  CreditCard,
  PiggyBank,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  SlidersHorizontal,
} from 'lucide-react';

interface BudgetSummaryCardsProps {
  metrics: DashboardMetrics;
  topCategoryName?: string;
  topCategoryAmount?: number;
  onOpenBudgetModal: () => void;
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  metrics,
  topCategoryName = 'None',
  topCategoryAmount = 0,
  onOpenBudgetModal,
}) => {
  const isOverBudget = metrics.totalExpenses > metrics.totalBudget;
  const isNearBudget =
    !isOverBudget && metrics.budgetUsedPercent >= 80;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Overview Top Section Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Monthly Financial Overview
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-md">
                Executive View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-level cashflow velocity, budget burn rate, and net savings for this billing cycle
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Configure Budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Spent vs Budget */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Monthly Budget</span>
            <button
              onClick={onOpenBudgetModal}
              className="text-slate-400 hover:text-slate-700 text-xs underline cursor-pointer transition-colors"
            >
              Adjust
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.totalExpenses)}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              / {formatCurrency(metrics.totalBudget)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearBudget
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, metrics.budgetUsedPercent))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Clean unboxed metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {isOverBudget ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span
              className={`font-medium ${
                isOverBudget
                  ? 'text-rose-700'
                  : isNearBudget
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {isOverBudget
                ? 'Exceeded Budget'
                : isNearBudget
                ? 'Approaching Limit'
                : 'Within Safe Budget'}
            </span>
          </div>
          <span className="text-slate-500 font-mono tabular-nums">
            {metrics.budgetUsedPercent.toFixed(1)}% used
          </span>
        </div>
      </div>

      {/* Card 2: Income & Net Savings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Net Monthly Savings</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
                metrics.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {metrics.netSavings >= 0 ? '+' : ''}
              {formatCurrency(metrics.netSavings)}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span>Income: {formatCurrency(metrics.totalIncome)}</span>
            <span aria-hidden="true">·</span>
            <span>Expenses: {formatCurrency(metrics.totalExpenses)}</span>
          </div>
        </div>

        {/* Clean unboxed metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Savings Rate</span>
          <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Card 3: Daily Average Burn Rate */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Daily Burn Rate</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.dailyAverage)}
            </span>
            <span className="text-xs text-slate-500">/ day avg</span>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Target allowance: {formatCurrency(metrics.dailyTargetAllowance)} / day
          </div>
        </div>

        {/* Clean unboxed metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600">
            <span>Pace:</span>
            {metrics.dailyAverage <= metrics.dailyTargetAllowance ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> Under Target
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Over Pace
              </span>
            )}
          </div>
          <span className="text-slate-400 font-mono tabular-nums">
            Day {metrics.daysElapsed} of {metrics.daysInMonth}
          </span>
        </div>
      </div>

      {/* Card 4: Top Category & Activity */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Highest Expense Area</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="truncate">
            <span className="text-xl font-bold tracking-tight text-slate-900 truncate block">
              {topCategoryName}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {formatCurrency(topCategoryAmount)}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {metrics.totalExpenses > 0
                ? ((topCategoryAmount / metrics.totalExpenses) * 100).toFixed(0)
                : 0}
              % of total spend
            </span>
          </div>
        </div>

        {/* Clean unboxed metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Active Ledger</span>
          <span className="font-mono tabular-nums font-medium text-slate-900">
            {metrics.transactionCount} transactions
          </span>
        </div>
      </div>
    </div>
    </div>
  );
};
