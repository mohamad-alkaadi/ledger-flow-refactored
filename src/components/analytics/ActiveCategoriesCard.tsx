import { useTransactions } from "@/src/context/TransactionsContext";
import { formatCurrency } from "@/src/utils/currencyUtils";
import { TrendingUp } from "lucide-react";

const ActiveCategoriesCard = ({
  categorySpending,
  metrics,
}: {
  categorySpending: any;
  metrics: any;
}) => {
  const { selectedCategory } = useTransactions();

  const activeCategories = categorySpending.filter((c: any) => c.amount > 0);

  return (
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
            of {categorySpending.length} configured
          </span>
        </div>

        <div className="mt-2 text-xs text-slate-500">
          Avg spent per active bucket:{" "}
          <strong className="text-slate-800 font-mono">
            {formatCurrency(
              activeCategories.length > 0
                ? metrics.totalExpenses / activeCategories.length
                : 0,
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
  );
};

export default ActiveCategoriesCard;
