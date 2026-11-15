import { useTransactions } from "@/src/context/TransactionsContext";
import { MONTHS_LIST } from "@/src/data/monthsList";
import { Calendar, Plus, SlidersHorizontal } from "lucide-react";

const HeaderPrimaryActions = () => {
  const {
    setEditingTransaction,
    setIsAddModalOpen,
    setIsBudgetModalOpen,
    selectedMonth,
    setSelectedMonth,
    setSelectedCategory,
  } = useTransactions();

  const onOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };
  const onMonthChange = (m: any) => {
    setSelectedMonth(m);
    setSelectedCategory(null);
  };
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Month select dropdown */}
      <div className="relative inline-flex items-center">
        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="pl-8 pr-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border-0 focus:ring-2 focus:ring-slate-900 cursor-pointer transition-colors"
          aria-label="Select active month"
        >
          {MONTHS_LIST.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Configuration button */}
      <button
        onClick={() => setIsBudgetModalOpen(true)}
        title="Edit Budget Targets"
        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
        <span>Budget Plan</span>
      </button>

      {/* New Transaction Button */}
      <button
        onClick={onOpenAddModal}
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Transaction</span>
      </button>
    </div>
  );
};

export default HeaderPrimaryActions;
