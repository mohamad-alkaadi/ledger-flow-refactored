import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { MonthlyBudgetConfig } from "../types/expense";
import {
  calculateCategorySpending,
  calculateDailySpending,
  calculateDashboardMetrics,
  getMonthBudgetConfig,
  getStoredBudgets,
} from "../services/expenseService";
import { useTransactions } from "./TransactionsContext";

interface BudgetAndSpendingType {
  dailySpending: any;
  budgetConfigs: any;
  currentBudgetConfig: any;
  metrics: any;
  categorySpending: any;
  isAddModalOpen: any;
  setIsAddModalOpen: any;
  isBudgetModalOpen: any;
  setIsBudgetModalOpen: any;
  setBudgetConfigs: any;
}

interface BudgetAndSpendingProviderProps {
  children: ReactNode;
}

const BudgetAndSpendingContext = createContext<
  BudgetAndSpendingType | undefined
>(undefined);

export const BudgetAndSpendingProvider: FC<BudgetAndSpendingProviderProps> = ({
  children,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetConfigs, setBudgetConfigs] = useState<
    Record<string, MonthlyBudgetConfig>
  >(() => getStoredBudgets());
  const { selectedMonth, transactions } = useTransactions();
  // Current month's budget configuration
  const currentBudgetConfig = useMemo(() => {
    return budgetConfigs[selectedMonth] || getMonthBudgetConfig(selectedMonth);
  }, [budgetConfigs, selectedMonth]);
  // // Calculations for current month
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      transactions,
      selectedMonth,
      currentBudgetConfig,
    );
  }, [transactions, selectedMonth, currentBudgetConfig]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(
      transactions,
      selectedMonth,
      currentBudgetConfig,
    );
  }, [transactions, selectedMonth, currentBudgetConfig]);

  const dailySpending = useMemo(() => {
    return calculateDailySpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);
  const value = {
    metrics,
    categorySpending,
    dailySpending,
    budgetConfigs,
    currentBudgetConfig,
    isAddModalOpen,
    setIsAddModalOpen,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    setBudgetConfigs,
  };
  return (
    <BudgetAndSpendingContext.Provider value={value}>
      {children}
    </BudgetAndSpendingContext.Provider>
  );
};

export const useBudgetAndSpending = (): BudgetAndSpendingType => {
  const context = useContext(BudgetAndSpendingContext);
  if (!context) {
    throw new Error(
      "useBudgetAndSpending must be used within a BudgetAndSpendingProvider",
    );
  }
  return context;
};
