import { useBudgetAndSpending } from "../../context/BudgetAndSpendingContext";
import TopExpenseDriver from "./TopExpenseDriverCard";
import CategoryAdherenceCard from "./CategoryAdherenceCard";
import NeedsVsWantsRatioCard from "./NeedsVsWantsRatioCard";
import ActiveCategoriesCard from "./ActiveCategoriesCard";
import CategoryAnalyticsHeader from "./CategoryAnalyticsHeader";

export const CategoryAnalyticsCards = () => {
  const { categorySpending, metrics, setIsBudgetModalOpen } =
    useBudgetAndSpending();

  return (
    <div className="space-y-4">
      {/* Category Analytics Top Section Header */}
      <CategoryAnalyticsHeader setIsBudgetModalOpen={setIsBudgetModalOpen} />

      {/* Specialized Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Concentration & Top Driver */}
        <TopExpenseDriver
          categorySpending={categorySpending}
          metrics={metrics}
        />
        {/* Card 2: Budget Variance & Overspend Alerts */}
        <CategoryAdherenceCard categorySpending={categorySpending} />
        {/* Card 3: Essential vs Discretionary Split */}
        <NeedsVsWantsRatioCard
          metrics={metrics}
          categorySpending={categorySpending}
        />
        {/* Card 4: Active Footprint & Average Allocation */}
        <ActiveCategoriesCard
          categorySpending={categorySpending}
          metrics={metrics}
        />
      </div>
    </div>
  );
};
