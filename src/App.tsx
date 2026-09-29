import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Transaction,
  MonthlyBudgetConfig,
  ExpenseCategory,
} from "./types/expense";
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
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGET_CONFIGS } from "./data/mockData";
import { Header } from "./components/common/Header";
import { BudgetSummaryCards } from "./components/BudgetSummaryCards";
import { CategoryAnalyticsCards } from "./components/CategoryAnalyticsCards";
import { TransactionsSummaryCards } from "./components/TransactionsSummaryCards";
import { CategoryPieChart } from "./components/charts/CategoryPieChart";
import { CategoryBarChart } from "./components/charts/CategoryBarChart";
import { CategoryHealthMatrix } from "./components/charts/CategoryHealthMatrix";
import { CategoryTrendComparison } from "./components/charts/CategoryTrendComparison";
import { TransactionTable } from "./components/TransactionTable";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { BudgetSettingsModal } from "./components/BudgetSettingsModal";
import { CategoryAnalyticsBreakdown } from "./components/CategoryAnalyticsBreakdown";
import { Filter, CheckCircle, X } from "lucide-react";
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

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveStoredTransactions(updated);
      showToast("Transaction removed from ledger.");

      try {
        await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      } catch {
        // Fallback
      }
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

  const handleResetData = useCallback(async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveStoredTransactions(INITIAL_TRANSACTIONS);
    setBudgetConfigs(DEFAULT_BUDGET_CONFIGS);
    saveStoredBudgets(DEFAULT_BUDGET_CONFIGS);
    setSelectedCategory(null);
    showToast("Mock data reset to original defaults.");

    try {
      await fetch("/api/reset", { method: "POST" });
    } catch {
      // Fallback
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      [
        "ID",
        "Date",
        "Type",
        "Category",
        "Merchant",
        "Description",
        "Amount",
        "Payment Method",
        "Notes",
      ],
      ...monthTransactions.map((tx) => [
        tx.id,
        tx.date,
        tx.type,
        `"${tx.category}"`,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        tx.paymentMethod,
        `"${(tx.notes || "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LedgerFlow_Expenses_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${monthTransactions.length} transactions to CSV.`);
  }, [monthTransactions, selectedMonth]);

  const monthLabel =
    MONTHS_LIST.find((m) => m.value === selectedMonth)?.label.split(" (")[0] ||
    selectedMonth;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
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
            handleDeleteTransaction={handleDeleteTransaction}
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
            handleExportCSV={handleExportCSV}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            handleEditTransaction={handleEditTransaction}
            handleDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </main>

      {/* Footer */}

      <Footer handleResetData={handleResetData} />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
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
