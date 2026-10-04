import { BudgetSummaryCards } from "../BudgetSummaryCards";
import { CategoryPieChart } from "../charts/CategoryPieChart";
import { CategoryBarChart } from "../charts/CategoryBarChart";
import { TransactionTable } from "../TransactionTable";
import { Transaction } from "@/src/types/expense";

const Overview = ({
  metrics,
  dailySpending,
  categorySpending,
  selectedCategory,
  monthTransactions,
  setIsBudgetModalOpen,
  setSelectedCategory,
  setEditingTransaction,
  setIsAddModalOpen,
  setTransactions,
  saveStoredTransactions,
  showToast,
}: {
  metrics: any;
  dailySpending: any;
  categorySpending: any;
  selectedCategory: any;
  monthTransactions: any;
  setIsBudgetModalOpen: any;
  setSelectedCategory: any;
  setEditingTransaction: any;
  setIsAddModalOpen: any;
  setTransactions: any;
  saveStoredTransactions: any;
  showToast: any;
}) => {
  const topCategory = categorySpending.length > 0 ? categorySpending[0] : null;

  return (
    <div>
      <BudgetSummaryCards
        metrics={metrics}
        topCategoryName={topCategory?.category}
        topCategoryAmount={topCategory?.amount}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />
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
      <TransactionTable
        transactions={monthTransactions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        setTransactions={setTransactions}
        saveStoredTransactions={saveStoredTransactions}
        showToast={showToast}
        setEditingTransaction={setEditingTransaction}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    </div>
  );
};

export default Overview;
