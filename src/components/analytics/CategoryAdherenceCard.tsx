import { formatCurrency } from "@/src/utils/currencyUtils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import React from "react";

const CategoryAdherenceCard = ({
  categorySpending,
}: {
  categorySpending: any;
}) => {
  const overBudgetCategories = categorySpending.filter(
    (c: any) => c.amount > c.allocated && c.allocated > 0,
  );
  const onTrackCategories = categorySpending.filter(
    (c: any) => c.amount <= c.allocated && c.allocated > 0,
  );

  const totalOverSpend = overBudgetCategories.reduce(
    (sum: any, c: any) => sum + (c.amount - c.allocated),
    0,
  );

  return (
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
              overBudgetCategories.length > 0
                ? "text-rose-600"
                : "text-emerald-700"
            }`}
          >
            {overBudgetCategories.length > 0
              ? `${overBudgetCategories.length} Over Budget`
              : "All on Track"}
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500">
          {overBudgetCategories.length > 0 ? (
            <span>
              Exceeded allocations by{" "}
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
          {onTrackCategories.length} / {categorySpending.length}
        </span>
      </div>
    </div>
  );
};

export default CategoryAdherenceCard;
