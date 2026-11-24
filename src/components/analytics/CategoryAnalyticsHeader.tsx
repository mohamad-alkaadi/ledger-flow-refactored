import { PieChart, SlidersHorizontal } from "lucide-react";
import React from "react";

const CategoryAnalyticsHeader = ({
  setIsBudgetModalOpen,
}: {
  setIsBudgetModalOpen: any;
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center font-bold">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Category Spending & Allocation Analytics
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-violet-100 text-violet-800 rounded-md">
              Distribution View
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Audit budget variance, spending concentration, and category risk
            factors across this cycle
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsBudgetModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Adjust Category Targets</span>
      </button>
    </div>
  );
};

export default CategoryAnalyticsHeader;
