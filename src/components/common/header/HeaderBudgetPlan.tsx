import { useBudgetAndSpending } from "@/src/context/BudgetAndSpendingContext";
import { SlidersHorizontal } from "lucide-react";

const HeaderBudgetPlan = () => {
  const { setIsBudgetModalOpen } = useBudgetAndSpending();
  return (
    <button
      onClick={() => setIsBudgetModalOpen(true)}
      title="Edit Budget Targets"
      className="cursor-pointer hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
    >
      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
      <span>Budget Plan</span>
    </button>
  );
};

export default HeaderBudgetPlan;
