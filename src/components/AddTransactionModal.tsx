import React, { useState, useEffect, useCallback } from "react";
import {
  ExpenseCategory,
  PaymentMethod,
  Transaction,
  TransactionType,
} from "../types/expense";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_BUDGETS } from "../data/mockData";
import {
  X,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  Check,
} from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave: (transactionData: Omit<Transaction, "id">, editId?: string) => void;
  editingTransaction?: Transaction | null;
  defaultMonth?: string;
  transactions: any;
  setTransactions: any;
  saveStoredTransactions: any;
  setEditingTransaction: any;
  showToast: any;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Housing & Rent",
  "Food & Groceries",
  "Dining & Coffee",
  "Transportation",
  "Utilities & Bills",
  "Entertainment & Subscriptions",
  "Healthcare & Wellness",
  "Shopping & Retail",
  "Travel & Leisure",
  "Education & Tech",
  "Other",
];

const INCOME_CATEGORIES: ExpenseCategory[] = ["Income & Salary", "Other"];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  // onSave,
  editingTransaction,
  defaultMonth = "2026-09",
  transactions,
  setTransactions,
  saveStoredTransactions,
  setEditingTransaction,
  showToast,
}) => {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Groceries");
  const [date, setDate] = useState(`${defaultMonth}-27`);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit_card");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSave = useCallback(
    async (txData: Omit<Transaction, "id">, editId?: string) => {
      let updatedTransactions: Transaction[];

      if (editId) {
        updatedTransactions = transactions.map((t: any) =>
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
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setMerchant(editingTransaction.merchant);
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || "");
    } else {
      setType("expense");
      setAmount("");
      setMerchant("");
      setDescription("");
      setCategory("Food & Groceries");
      setDate(`${defaultMonth}-27`);
      setPaymentMethod("credit_card");
      setNotes("");
    }
    setErrors({});
  }, [editingTransaction, defaultMonth, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = "Please enter a valid amount greater than 0";
    }
    if (!merchant.trim()) {
      errs.merchant = "Merchant / Payee is required";
    }
    if (!description.trim()) {
      errs.description = "Description is required";
    }
    if (!date) {
      errs.date = "Date is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        type,
        amount: parseFloat(amount),
        merchant: merchant.trim(),
        description: description.trim(),
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
        status: "completed",
      },
      editingTransaction ? editingTransaction.id : undefined,
    );
    onClose();
  };

  const activeCategories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {editingTransaction ? "Edit Transaction" : "Record Transaction"}
            </h3>
            <p className="text-xs text-slate-500">
              {editingTransaction
                ? "Update transaction parameters in the ledger"
                : "Log a new cash outflow or inflow with category tags"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setCategory("Food & Groceries");
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === "expense"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Expense Outflow
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategory("Income & Salary");
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === "income"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Income Inflow
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Amount ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white border rounded-lg focus:outline-hidden ${
                    errors.amount
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-800"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transaction Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono text-slate-900 bg-white border rounded-lg focus:outline-hidden ${
                    errors.date
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-800"
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-rose-600">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Merchant & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Merchant / Payee *
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Whole Foods, Apple, Stripe"
                className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden ${
                  errors.merchant
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200 focus:border-slate-800"
                }`}
              />
              {errors.merchant && (
                <p className="mt-1 text-xs text-rose-600">{errors.merchant}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Weekly Groceries, Cloud Bill"
                className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden ${
                  errors.description
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200 focus:border-slate-800"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ExpenseCategory)
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 focus:border-slate-800 rounded-lg focus:outline-hidden"
                >
                  {activeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 focus:border-slate-800 rounded-lg focus:outline-hidden"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">ACH Direct Transfer</option>
                  <option value="digital_wallet">Apple / Google Pay</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional tags, project names, or receipt details"
                rows={2}
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 focus:border-slate-800 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {editingTransaction ? "Save Changes" : "Record Transaction"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
