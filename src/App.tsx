import { useState, useEffect, useMemo, useCallback } from "react";
import { Transaction, MonthlyBudgetConfig } from "./types/expense";
import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredBudgets,
  saveStoredBudgets,
  getMonthBudgetConfig,
  calculateDashboardMetrics,
  calculateCategorySpending,
  calculateDailySpending,
  calculateMultiMonthCategoryTrends,
} from "./services/expenseService";
import { Header } from "./components/common/Header";
import { CategoryAnalyticsCards } from "./components/CategoryAnalyticsCards";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { BudgetSettingsModal } from "./components/BudgetSettingsModal";
import { Filter, X } from "lucide-react";
import Footer from "./components/common/Footer";
import Overview from "./components/overview/Overview";
import Transactions from "./components/transactions/Transactions";
import Analytics from "./components/analytics/Analytics";
import ToastNotification from "./components/common/ToastNotification";

const MONTHS_LIST = [
  { value: "2026-09", label: "September 2026 (Current)" },
  { value: "2026-08", label: "August 2026" },
  { value: "2026-07", label: "July 2026" },
];

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "transactions"
  >("overview");
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredTransactions(),
  );
  const [budgetConfigs, setBudgetConfigs] = useState<
    Record<string, MonthlyBudgetConfig>
  >(() => getStoredBudgets());

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync with backend API when mounted
  useEffect(() => {
    async function fetchFromBackend() {
      try {
        const res = await fetch(`/api/transactions?month=${selectedMonth}`);
        if (res.ok) {
          const data = await res.json();
          if (data.transactions && data.transactions.length > 0) {
            // Merge or update
            setTransactions((prev) => {
              const otherMonths = prev.filter(
                (t) => !t.date.startsWith(selectedMonth),
              );
              const combined = [...data.transactions, ...otherMonths];
              saveStoredTransactions(combined);
              return combined;
            });
          }
        }
      } catch {
        // Runs cleanly on local storage
      }
    }
    fetchFromBackend();
  }, [selectedMonth]);

  // Current month's budget configuration
  const currentBudgetConfig = useMemo(() => {
    return budgetConfigs[selectedMonth] || getMonthBudgetConfig(selectedMonth);
  }, [budgetConfigs, selectedMonth]);

  // Calculations for current month
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      transactions,
      selectedMonth,
      currentBudgetConfig,
    );
  }, [transactions, selectedMonth, currentBudgetConfig]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(
      transactions,
      selectedMonth,
      currentBudgetConfig,
    );
  }, [transactions, selectedMonth, currentBudgetConfig]);

  const dailySpending = useMemo(() => {
    return calculateDailySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const multiMonthTrends = useMemo(() => {
    return calculateMultiMonthCategoryTrends(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Top spending category
  const topCategory = categorySpending.length > 0 ? categorySpending[0] : null;

  // Month-filtered transactions for table
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Handlers for transactions
  const handleSaveTransaction = useCallback(
    async (txData: Omit<Transaction, "id">, editId?: string) => {
      let updatedTransactions: Transaction[];

      if (editId) {
        updatedTransactions = transactions.map((t) =>
          t.id === editId ? { ...t, ...txData, id: editId } : t,
        );
        showToast("Transaction successfully updated.");

        // Attempt API sync
        try {
          await fetch(`/api/transactions/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(txData),
          });
        } catch {
          // Local fallback handled
        }
      } else {
        const newTx: Transaction = {
          ...txData,
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        };
        updatedTransactions = [newTx, ...transactions];
        showToast("New transaction recorded to ledger.");

        // Attempt API sync
        try {
          await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTx),
          });
        } catch {
          // Local fallback handled
        }
      }

      setTransactions(updatedTransactions);
      saveStoredTransactions(updatedTransactions);
      setEditingTransaction(null);
    },
    [transactions],
  );

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleSaveBudget = useCallback(
    async (updatedBudget: MonthlyBudgetConfig) => {
      const updatedConfigs = {
        ...budgetConfigs,
        [updatedBudget.month]: updatedBudget,
      };
      setBudgetConfigs(updatedConfigs);
      saveStoredBudgets(updatedConfigs);
      showToast(`Budget targets updated for ${selectedMonth}.`);

      try {
        await fetch(`/api/budgets/${updatedBudget.month}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBudget),
        });
      } catch {
        // Fallback
      }
    },
    [budgetConfigs, selectedMonth],
  );

  const monthLabel =
    MONTHS_LIST.find((m) => m.value === selectedMonth)?.label.split(" (")[0] ||
    selectedMonth;
  // ---------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab: string) =>
          setActiveTab(tab as "overview" | "analytics" | "transactions")
        }
        selectedMonth={selectedMonth}
        onMonthChange={(m) => {
          setSelectedMonth(m);
          setSelectedCategory(null);
        }}
        monthsList={MONTHS_LIST}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Selected Category Filter Banner */}
        {selectedCategory && (
          <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>
                Filtering views by category:{" "}
                <strong className="underline">{selectedCategory}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {activeTab === "analytics" && (
          <CategoryAnalyticsCards
            categories={categorySpending}
            metrics={metrics}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        )}

        {activeTab === "overview" && (
          <Overview
            metrics={metrics}
            topCategory={topCategory}
            dailySpending={dailySpending}
            categorySpending={categorySpending}
            selectedCategory={selectedCategory}
            monthTransactions={monthTransactions}
            handleEditTransaction={handleEditTransaction}
            setIsBudgetModalOpen={setIsBudgetModalOpen}
            setSelectedCategory={setSelectedCategory}
            setEditingTransaction={setEditingTransaction}
            setIsAddModalOpen={setIsAddModalOpen}
            setTransactions={setTransactions}
            saveStoredTransactions={saveStoredTransactions}
            showToast={showToast}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics
            categorySpending={categorySpending}
            monthTransactions={monthTransactions}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setIsBudgetModalOpen={setIsBudgetModalOpen}
            setActiveTab={setActiveTab}
            multiMonthTrends={multiMonthTrends}
            metrics={metrics}
          />
        )}

        {activeTab === "transactions" && (
          <Transactions
            monthTransactions={monthTransactions}
            setEditingTransaction={setEditingTransaction}
            setIsAddModalOpen={setIsAddModalOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            handleEditTransaction={handleEditTransaction}
            selectedMonth={selectedMonth}
            setTransactions={setTransactions}
            saveStoredTransactions={saveStoredTransactions}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}

      <Footer
        setTransactions={setTransactions}
        saveStoredTransactions={saveStoredTransactions}
        setBudgetConfigs={setBudgetConfigs}
        saveStoredBudgets={saveStoredBudgets}
        setSelectedCategory={setSelectedCategory}
        showToast={showToast}
      />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        // onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
        transactions={transactions}
        setTransactions={setTransactions}
        saveStoredTransactions={saveStoredTransactions}
        setEditingTransaction={setEditingTransaction}
        showToast={showToast}
      />

      {/* Budget Configuration Modal */}
      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={currentBudgetConfig}
        onSaveBudget={handleSaveBudget}
        monthName={monthLabel}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <ToastNotification
          toastMessage={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
}
