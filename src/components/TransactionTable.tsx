import React, { useState, useMemo } from 'react';
import { ExpenseCategory, Transaction, TransactionType } from '../types/expense';
import { CATEGORY_COLORS } from '../data/mockData';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

type SortField = 'date' | 'amount' | 'merchant' | 'category';
type SortOrder = 'asc' | 'desc';

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Available unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (selectedCategory && tx.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = tx.merchant.toLowerCase().includes(q);
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const matchCat = tx.category.toLowerCase().includes(q);
          if (!matchMerchant && !matchDesc && !matchNotes && !matchCat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          comparison = a.amount - b.amount;
        } else if (sortField === 'merchant') {
          comparison = a.merchant.localeCompare(b.merchant);
        } else if (sortField === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [transactions, typeFilter, selectedCategory, searchQuery, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(year, month, day));
    } catch {
      return dateStr;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
      case 'digital_wallet':
        return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatPaymentLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Direct ACH / Wire';
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

  const hasActiveFilters =
    searchQuery.trim() !== '' || typeFilter !== 'all' || selectedCategory !== null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Transaction History
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredTransactions.length} recorded entries
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search merchant, description, notes..."
              className="w-full pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 focus:outline-hidden rounded-lg transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Segmented Type Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown & Reset Filter */}
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedCategory || 'all'}
                onChange={(e) => {
                  onSelectCategory(e.target.value === 'all' ? null : e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-7 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  onSelectCategory(null);
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 tracking-wider">
              <th className="py-2.5 px-4 sm:px-6">
                <button
                  onClick={() => handleSort('date')}
                  className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors uppercase"
                >
                  <span>Date</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-slate-900" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-4">
                <button
                  onClick={() => handleSort('merchant')}
                  className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors uppercase"
                >
                  <span>Merchant & Description</span>
                  {sortField === 'merchant' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-slate-900" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-4 hidden md:table-cell">
                <button
                  onClick={() => handleSort('category')}
                  className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors uppercase"
                >
                  <span>Category</span>
                  {sortField === 'category' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-slate-900" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-4 hidden lg:table-cell uppercase">
                Payment Method
              </th>
              <th className="py-2.5 px-4 sm:px-6 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors uppercase ml-auto"
                >
                  <span>Amount</span>
                  {sortField === 'amount' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-slate-900" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-4 text-right uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      No transactions match your criteria
                    </p>
                    <p className="text-xs text-slate-500">
                      Try resetting your filters or log a new transaction to the
                      ledger.
                    </p>
                    <button
                      onClick={onOpenAddModal}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log New Entry</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const catColor = CATEGORY_COLORS[tx.category]?.color || '#64748b';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap font-mono tabular-nums text-slate-600">
                      {formatDate(tx.date)}
                    </td>

                    {/* Merchant & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {tx.merchant}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        <span>{tx.description}</span>
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="italic">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Category (Clean unboxed metadata) */}
                    <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <button
                          onClick={() => onSelectCategory(tx.category)}
                          className="text-slate-700 hover:text-slate-900 hover:underline transition-colors text-xs"
                        >
                          {tx.category}
                        </button>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 hidden lg:table-cell whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        {getPaymentIcon(tx.paymentMethod)}
                        <span>{formatPaymentLabel(tx.paymentMethod)}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap font-mono tabular-nums font-semibold">
                      <span
                        className={
                          isExpense ? 'text-slate-900' : 'text-emerald-700'
                        }
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {deletingId === tx.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              onDeleteTransaction(tx.id);
                              setDeletingId(null);
                            }}
                            className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaction"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            title="Delete transaction"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="font-mono tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
