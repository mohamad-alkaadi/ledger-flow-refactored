import { useState, useEffect, useMemo } from "react";
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
import { fetchFromBackend } from "./utils/apiTools";
import FilteringByHeader from "./components/common/FilteringByHeader";

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
    fetchFromBackend(selectedMonth, setTransactions, saveStoredTransactions);
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

  // Month-filtered transactions for table
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

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
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Selected Category Filter Banner */}
        {selectedCategory && (
          <FilteringByHeader
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
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
            dailySpending={dailySpending}
            categorySpending={categorySpending}
            selectedCategory={selectedCategory}
            monthTransactions={monthTransactions}
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
            metrics={metrics}
            calculateMultiMonthCategoryTrends={
              calculateMultiMonthCategoryTrends
            }
            transactions={transactions}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === "transactions" && (
          <Transactions
            monthTransactions={monthTransactions}
            setEditingTransaction={setEditingTransaction}
            setIsAddModalOpen={setIsAddModalOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
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
        budgetConfigs={budgetConfigs}
        setBudgetConfigs={setBudgetConfigs}
        saveStoredBudgets={saveStoredBudgets}
        showToast={showToast}
        selectedMonth={selectedMonth}
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
