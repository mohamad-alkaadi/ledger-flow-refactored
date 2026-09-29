import React from "react";
import { CategoryAnalyticsBreakdown } from "../CategoryAnalyticsBreakdown";
import { CategoryTrendComparison } from "../charts/CategoryTrendComparison";
import { CategoryHealthMatrix } from "../charts/CategoryHealthMatrix";

const Analytics = ({
  categorySpending,
  monthTransactions,
  selectedCategory,
  setSelectedCategory,
  setIsBudgetModalOpen,
  setActiveTab,
  multiMonthTrends,
  metrics,
}: {
  categorySpending: any;
  monthTransactions: any;
  selectedCategory: any;
  setSelectedCategory: any;
  setIsBudgetModalOpen: any;
  setActiveTab: any;
  multiMonthTrends: any;
  metrics: any;
}) => {
  return (
    <div>
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
              setActiveTab("transactions");
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
      <CategoryAnalyticsBreakdown
        categories={categorySpending}
        totalExpenses={metrics.totalExpenses}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab("transactions");
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />
    </div>
  );
};

export default Analytics;
