import { formatCurrency } from "@/src/utils/currencyUtils";
import { Layers } from "lucide-react";

const TopExpenseDriverCard = ({
  categorySpending,
  metrics,
}: {
  categorySpending: any;
  metrics: any;
}) => {
  const top3 = categorySpending.slice(0, 3);
  const top3Total = top3.reduce((sum: any, c: any) => sum + c.amount, 0);
  const top3Share =
    metrics.totalExpenses > 0 ? (top3Total / metrics.totalExpenses) * 100 : 0;
  const topCategory = categorySpending[0] || null;

  return (
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
  );
};

export default TopExpenseDriverCard;
