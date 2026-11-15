import { useBudgetAndSpending } from "@/src/context/BudgetAndSpendingContext";
import { useTransactions } from "@/src/context/TransactionsContext";
import { Plus } from "lucide-react";

const HeaderAddTransaction = () => {
  const { setEditingTransaction } = useTransactions();
  const { setIsAddModalOpen } = useBudgetAndSpending();

  const onOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };
  return (
    <button
      onClick={onOpenAddModal}
      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap active:scale-[0.98] cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Add Transaction</span>
    </button>
  );
};

export default HeaderAddTransaction;
