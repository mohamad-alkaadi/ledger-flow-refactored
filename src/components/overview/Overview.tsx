import { BudgetSummaryCards } from "../BudgetSummaryCards";
import { CategoryPieChart } from "../charts/CategoryPieChart";
import { CategoryBarChart } from "../charts/CategoryBarChart";
import { TransactionTable } from "../TransactionTable";
import { Transaction } from "@/src/types/expense";
import { useTransactions } from "@/src/context/TransactionsContext";
import { useBudgetAndSpending } from "@/src/context/BudgetAndSpendingContext";

const Overview = ({ showToast }: { showToast: any }) => {
  const { selectedCategory, setSelectedCategory } = useTransactions();
  const {
    metrics,
    categorySpending,
    dailySpending,
    setIsBudgetModalOpen,
    setIsAddModalOpen,
  } = useBudgetAndSpending();
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
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showToast={showToast}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    </div>
  );
};

export default Overview;
