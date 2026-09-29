import React from "react";
import { BudgetSummaryCards } from "../BudgetSummaryCards";
import { CategoryPieChart } from "../charts/CategoryPieChart";
import { CategoryBarChart } from "../charts/CategoryBarChart";
import { TransactionTable } from "../TransactionTable";

const Overview = ({
  metrics,
  topCategory,
  dailySpending,
  categorySpending,
  selectedCategory,
  monthTransactions,
  handleEditTransaction,
  setIsBudgetModalOpen,
  setSelectedCategory,
  setEditingTransaction,
  setIsAddModalOpen,
  handleDeleteTransaction,
}: {
  metrics: any;
  topCategory: any;
  dailySpending: any;
  categorySpending: any;
  selectedCategory: any;
  monthTransactions: any;
  handleEditTransaction: any;
  setIsBudgetModalOpen: any;
  setSelectedCategory: any;
  setEditingTransaction: any;
  setIsAddModalOpen: any;
  handleDeleteTransaction: any;
}) => {
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
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};

export default Overview;
