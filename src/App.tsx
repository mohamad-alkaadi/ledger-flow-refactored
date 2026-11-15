import { useState } from "react";
import { Header } from "./components/common/header/Header";
import { CategoryAnalyticsCards } from "./components/CategoryAnalyticsCards";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { BudgetSettingsModal } from "./components/BudgetSettingsModal";
import Footer from "./components/common/Footer";
import Overview from "./components/overview/Overview";
import Transactions from "./components/transactions/Transactions";
import Analytics from "./components/analytics/Analytics";
import ToastNotification from "./components/common/ToastNotification";
import FilteringByHeader from "./components/common/FilteringByHeader";
import { TransactionsProvider } from "./context/TransactionsContext";
import { BudgetAndSpendingProvider } from "./context/BudgetAndSpendingContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "transactions"
  >("overview");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <TransactionsProvider>
      <BudgetAndSpendingProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <FilteringByHeader />
            {activeTab === "analytics" && <CategoryAnalyticsCards />}
            {activeTab === "overview" && <Overview showToast={showToast} />}
            {activeTab === "analytics" && (
              <Analytics setActiveTab={setActiveTab} />
            )}
            {activeTab === "transactions" && (
              <Transactions showToast={showToast} />
            )}
          </main>

          <Footer showToast={showToast} />

          <AddTransactionModal showToast={showToast} />

          <BudgetSettingsModal showToast={showToast} />

          {toastMessage && (
            <ToastNotification
              toastMessage={toastMessage}
              setToastMessage={setToastMessage}
            />
          )}
        </div>
      </BudgetAndSpendingProvider>
    </TransactionsProvider>
  );
}
