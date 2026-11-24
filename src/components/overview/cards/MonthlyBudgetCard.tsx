import { useBudgetAndSpending } from "@/src/context/BudgetAndSpendingContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import React from "react";

const MonthlyBudgetCard = () => {
  const { isOverBudget } = useBudgetAndSpending();
  return (
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
                  ? "bg-rose-500"
                  : isNearBudget
                    ? "bg-amber-500"
                    : "bg-emerald-500"
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
                ? "text-rose-700"
                : isNearBudget
                  ? "text-amber-700"
                  : "text-emerald-700"
            }`}
          >
            {isOverBudget
              ? "Exceeded Budget"
              : isNearBudget
                ? "Approaching Limit"
                : "Within Safe Budget"}
          </span>
        </div>
        <span className="text-slate-500 font-mono tabular-nums">
          {metrics.budgetUsedPercent.toFixed(1)}% used
        </span>
      </div>
    </div>
  );
};

export default MonthlyBudgetCard;
