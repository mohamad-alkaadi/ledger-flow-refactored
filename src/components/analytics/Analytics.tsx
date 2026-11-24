import React, { useMemo } from "react";
import { CategoryTrendComparison } from "../charts/CategoryTrendComparison";
import { CategoryHealthMatrix } from "./category-health-matrix/CategoryHealthMatrix";
import { useTransactions } from "@/src/context/TransactionsContext";
import { calculateMultiMonthCategoryTrends } from "@/src/services/expenseService";
import { useBudgetAndSpending } from "@/src/context/BudgetAndSpendingContext";
import { CategoryAnalyticsBreakdown } from "./CategoryAnalyticsBreakdown";
import { CategoryAnalyticsCards } from "./CategoryAnalyticsCards";

const Analytics = ({ setActiveTab }: { setActiveTab: any }) => {
  const { transactions, selectedMonth } = useTransactions();
  const { categorySpending, setIsBudgetModalOpen } = useBudgetAndSpending();
  const multiMonthTrends = useMemo(() => {
    return calculateMultiMonthCategoryTrends(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  return (
    <div>
      <CategoryAnalyticsCards />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Health & Allocation Inspector */}
        <div className="lg:col-span-6">
          <CategoryHealthMatrix
            categories={categorySpending}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Category Multi-Month Velocity & MoM Shift */}
        <div className="lg:col-span-6">
          <CategoryTrendComparison trendsData={multiMonthTrends} />
        </div>
      </div>
      <CategoryAnalyticsBreakdown
        categories={categorySpending}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default Analytics;
