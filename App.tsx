import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, MonthlyBudgetConfig, ExpenseCategory } from './types/expense';
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
} from './services/expenseService';
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGET_CONFIGS } from './data/mockData';
import { Header } from './components/Header';
import { BudgetSummaryCards } from './components/BudgetSummaryCards';
import { CategoryAnalyticsCards } from './components/CategoryAnalyticsCards';
import { TransactionsSummaryCards } from './components/TransactionsSummaryCards';
import { CategoryPieChart } from './components/charts/CategoryPieChart';
import { CategoryBarChart } from './components/charts/CategoryBarChart';
import { CategoryHealthMatrix } from './components/charts/CategoryHealthMatrix';
import { CategoryTrendComparison } from './components/charts/CategoryTrendComparison';
import { TransactionTable } from './components/TransactionTable';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { CategoryAnalyticsBreakdown } from './components/CategoryAnalyticsBreakdown';
import {
  Calendar,
  Filter,
  CheckCircle,
  X,
  Info,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const MONTHS_LIST = [
  { value: '2026-09', label: 'September 2026 (Current)' },
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-07', label: 'July 2026' },
];

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [budgetConfigs, setBudgetConfigs] = useState<Record<string, MonthlyBudgetConfig>>(() =>
    getStoredBudgets()
  );

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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
              const otherMonths = prev.filter((t) => !t.date.startsWith(selectedMonth));
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
    return calculateDashboardMetrics(transactions, selectedMonth, currentBudgetConfig);
  }, [transactions, selectedMonth, currentBudgetConfig]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, selectedMonth, currentBudgetConfig);
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
    async (txData: Omit<Transaction, 'id'>, editId?: string) => {
      let updatedTransactions: Transaction[];

      if (editId) {
        updatedTransactions = transactions.map((t) =>
          t.id === editId ? { ...t, ...txData, id: editId } : t
        );
        showToast('Transaction successfully updated.');

        // Attempt API sync
        try {
          await fetch(`/api/transactions/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        showToast('New transaction recorded to ledger.');

        // Attempt API sync
        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    [transactions]
  );

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveStoredTransactions(updated);
      showToast('Transaction removed from ledger.');

      try {
        await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      } catch {
        // Fallback
      }
    },
    [transactions]
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
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBudget),
        });
      } catch {
        // Fallback
      }
    },
    [budgetConfigs, selectedMonth]
  );

  const handleResetData = useCallback(async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveStoredTransactions(INITIAL_TRANSACTIONS);
    setBudgetConfigs(DEFAULT_BUDGET_CONFIGS);
    saveStoredBudgets(DEFAULT_BUDGET_CONFIGS);
    setSelectedCategory(null);
    showToast('Mock data reset to original defaults.');

    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {
      // Fallback
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['ID', 'Date', 'Type', 'Category', 'Merchant', 'Description', 'Amount', 'Payment Method', 'Notes'],
      ...monthTransactions.map((tx) => [
        tx.id,
        tx.date,
        tx.type,
        `"${tx.category}"`,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        tx.paymentMethod,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LedgerFlow_Expenses_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${monthTransactions.length} transactions to CSV.`);
  }, [monthTransactions, selectedMonth]);

  const monthLabel =
    MONTHS_LIST.find((m) => m.value === selectedMonth)?.label.split(' (')[0] ||
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
          setActiveTab(tab as 'overview' | 'analytics' | 'transactions')
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
        {/* Breadcrumb & Period Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">Personal Ledger</span>
            <span aria-hidden="true">/</span>
            <span>Monthly Fiscal View</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700 font-medium">{monthLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-semibold">
              {activeTab === 'overview'
                ? 'Overview'
                : activeTab === 'analytics'
                ? 'Category Analytics'
                : 'Transactions'}
            </span>
          </div>

          {/* Quick Month Filter Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-xs">
            {MONTHS_LIST.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setSelectedMonth(m.value);
                  setSelectedCategory(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedMonth === m.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {m.value === '2026-09' ? 'Sep 2026' : m.value === '2026-08' ? 'Aug 2026' : 'Jul 2026'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Filter Banner */}
        {selectedCategory && (
          <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>
                Filtering views by category:{' '}
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

        {/* Dynamic Top Section per Page */}
        {activeTab === 'overview' && (
          <BudgetSummaryCards
            metrics={metrics}
            topCategoryName={topCategory?.category}
            topCategoryAmount={topCategory?.amount}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <CategoryAnalyticsCards
            categories={categorySpending}
            metrics={metrics}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsSummaryCards
            transactions={monthTransactions}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* 2. Overview Interactive Charts: Spending Distribution & Budget vs. Actual */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie / Donut Chart */}
            <div className="lg:col-span-5">
              <CategoryPieChart
                categories={categorySpending}
                totalExpenses={metrics.totalExpenses}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Bar Chart (Budget vs Actual & Daily Velocity) */}
            <div className="lg:col-span-7">
              <CategoryBarChart
                categories={categorySpending}
                dailySpending={dailySpending}
                dailyTarget={metrics.dailyTargetAllowance}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        )}

        {/* 2. Category Analytics Dedicated Visualizations: Health Inspector & Multi-Month Velocity */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Health & Allocation Inspector */}
            <div className="lg:col-span-6">
              <CategoryHealthMatrix
                categories={categorySpending}
                transactions={monthTransactions}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                onViewInTransactions={(cat) => {
                  setSelectedCategory(cat);
                  setActiveTab('transactions');
                }}
              />
            </div>

            {/* Category Multi-Month Velocity & MoM Shift */}
            <div className="lg:col-span-6">
              <CategoryTrendComparison
                trendsData={multiMonthTrends}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        )}

        {/* 3. Category Analytics Table (Down Section Preserved) */}
        {activeTab === 'analytics' && (
          <CategoryAnalyticsBreakdown
            categories={categorySpending}
            totalExpenses={metrics.totalExpenses}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('transactions');
            }}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {/* 4. Transaction History Table */}
        {(activeTab === 'overview' || activeTab === 'transactions') && (
          <TransactionTable
            transactions={monthTransactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LedgerFlow</span>
            <span aria-hidden="true">·</span>
            <span>Client-Authoritative Financial Ledger</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Fiscal Calendar 2026</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="hover:text-slate-900 underline"
            >
              Reset Mock Dataset
            </button>
          </div>
        </div>
      </footer>

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
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
