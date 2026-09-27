import React from 'react';
import { Transaction } from '../types/expense';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Calculator,
  CreditCard,
  Plus,
  Download,
  Building2,
  Smartphone,
  Banknote,
} from 'lucide-react';

interface TransactionsSummaryCardsProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onExportCSV: () => void;
}

export const TransactionsSummaryCards: React.FC<TransactionsSummaryCardsProps> = ({
  transactions,
  onOpenAddModal,
  onExportCSV,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const incomeTx = transactions.filter((t) => t.type === 'income');

  const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);

  const avgExpense = expenseTx.length > 0 ? totalExpenses / expenseTx.length : 0;

  // Largest transaction
  const largestExpense =
    expenseTx.length > 0
      ? expenseTx.reduce((max, t) => (t.amount > max.amount ? t : max), expenseTx[0])
      : null;

  // Payment method frequency
  const methodCounts: Record<string, { count: number; total: number }> = {};
  expenseTx.forEach((t) => {
    if (!methodCounts[t.paymentMethod]) {
      methodCounts[t.paymentMethod] = { count: 0, total: 0 };
    }
    methodCounts[t.paymentMethod].count += 1;
    methodCounts[t.paymentMethod].total += t.amount;
  });

  let topMethod = 'credit_card';
  let topMethodCount = 0;
  Object.entries(methodCounts).forEach(([method, data]) => {
    if (data.count > topMethodCount) {
      topMethodCount = data.count;
      topMethod = method;
    }
  });

  const formatMethodName = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'ACH / Wire';
      case 'digital_wallet':
        return 'Apple / Google Pay';
      case 'cash':
        return 'Cash';
      case 'debit_card':
        return 'Debit Card';
      default:
        return 'Credit Card';
    }
  };

  return (
    <div className="space-y-4">
      {/* Transactions Top Section Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Transaction Stream & Ledger Audit
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-100 text-blue-800 rounded-md">
                Ledger View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Audit cash inflows, debit charges, and merchant transactions recorded in this period
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Specialized Transaction Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Outflows */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Total Outflows</span>
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Disbursed across {expenseTx.length} expense transactions
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Debit Activity</span>
            <span className="font-mono tabular-nums font-semibold text-rose-600">
              {expenseTx.length} debits
            </span>
          </div>
        </div>

        {/* Card 2: Inflows */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Total Inflows</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
                +{formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Received across {incomeTx.length} income deposits
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Net Velocity</span>
            <span
              className={`font-mono tabular-nums font-semibold ${
                totalIncome >= totalExpenses ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {totalIncome >= totalExpenses ? '+' : ''}
              {formatCurrency(totalIncome - totalExpenses)}
            </span>
          </div>
        </div>

        {/* Card 3: Average Ticket & Largest Transaction */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Average Ticket Size</span>
              <Calculator className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {formatCurrency(avgExpense)}
              </span>
              <span className="text-xs text-slate-500">/ charge</span>
            </div>

            <div className="mt-2 text-xs text-slate-500 truncate">
              {largestExpense ? (
                <span>
                  Max:{' '}
                  <strong className="text-slate-800 font-mono">
                    {formatCurrency(largestExpense.amount)}
                  </strong>{' '}
                  ({largestExpense.merchant})
                </span>
              ) : (
                'No recorded charges'
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Total Ledger Volume</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {transactions.length} items
            </span>
          </div>
        </div>

        {/* Card 4: Top Payment Channel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Primary Payment Channel</span>
              <CreditCard className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
              {formatMethodName(topMethod)}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Used in{' '}
              <strong className="text-slate-800 font-mono">{topMethodCount}</strong> of{' '}
              {expenseTx.length} expense payments
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Settlement Channel</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {expenseTx.length > 0
                ? ((topMethodCount / expenseTx.length) * 100).toFixed(0)
                : 0}
              % share
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
