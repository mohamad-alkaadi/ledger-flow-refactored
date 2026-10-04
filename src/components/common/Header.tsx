import React from "react";
import {
  Wallet,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Calendar,
} from "lucide-react";

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthsList: { value: string; label: string }[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenBudgetModal,
  activeTab,
  setActiveTab,
  selectedMonth,
  onMonthChange,
  monthsList,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark Brand element */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                LedgerFlow
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-600">
                FINANCIAL LEDGER
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Category Analytics
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === "transactions"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transactions
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Month selector */}
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
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Configuration button */}
            <button
              onClick={onOpenBudgetModal}
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
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden items-center justify-between pb-2.5 pt-1 border-t border-slate-100 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Category Analytics
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors whitespace-nowrap ${
              activeTab === "transactions"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Transactions
          </button>
        </div>
      </div>
    </header>
  );
};
