import { formatCurrency } from "@/src/utils/currencyUtils";
import { Sparkles } from "lucide-react";

const ESSENTIAL_CATEGORIES = new Set([
  "Housing & Rent",
  "Food & Groceries",
  "Utilities & Bills",
  "Healthcare & Wellness",
  "Transportation",
]);
const NeedsVsWantsRatioCard = ({
  metrics,
  categorySpending,
}: {
  metrics: any;
  categorySpending: any;
}) => {
  let essentialTotal = 0;
  let discretionaryTotal = 0;
  categorySpending.forEach((c: any) => {
    if (ESSENTIAL_CATEGORIES.has(c.category)) {
      essentialTotal += c.amount;
    } else {
      discretionaryTotal += c.amount;
    }
  });

  const discretionaryPercent =
    metrics.totalExpenses > 0
      ? (discretionaryTotal / metrics.totalExpenses) * 100
      : 0;

  const essentialPercent =
    metrics.totalExpenses > 0
      ? (essentialTotal / metrics.totalExpenses) * 100
      : 0;
  return (
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
          {formatCurrency(discretionaryTotal)} (
          {discretionaryPercent.toFixed(0)}%)
        </span>
      </div>
    </div>
  );
};

export default NeedsVsWantsRatioCard;
