import {
  DEFAULT_BUDGET_CONFIGS,
  DEFAULT_CATEGORY_BUDGETS,
  INITIAL_TRANSACTIONS,
  CATEGORY_COLORS,
} from '../data/mockData';
import {
  CategorySpending,
  DashboardMetrics,
  ExpenseCategory,
  MonthlyBudgetConfig,
  Transaction,
} from '../types/expense';

const STORAGE_KEYS = {
  TRANSACTIONS: 'ledgerflow_transactions_v1',
  BUDGETS: 'ledgerflow_budgets_v1',
};

// In-browser fallback storage ensuring zero data loss and immediate reactivity
export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function getStoredBudgets(): Record<string, MonthlyBudgetConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGET_CONFIGS));
      return DEFAULT_BUDGET_CONFIGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BUDGET_CONFIGS;
  }
}

export function saveStoredBudgets(budgets: Record<string, MonthlyBudgetConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets to localStorage', e);
  }
}

export function getMonthBudgetConfig(month: string): MonthlyBudgetConfig {
  const allBudgets = getStoredBudgets();
  if (allBudgets[month]) {
    return allBudgets[month];
  }
  // Fallback default budget
  const defaultCategoryBudgets: Record<string, number> = {};
  DEFAULT_CATEGORY_BUDGETS.forEach((b) => {
    defaultCategoryBudgets[b.category] = b.allocated;
  });
  const fallback: MonthlyBudgetConfig = {
    month,
    totalBudget: 4500,
    categoryBudgets: defaultCategoryBudgets,
  };
  allBudgets[month] = fallback;
  saveStoredBudgets(allBudgets);
  return fallback;
}

export function calculateDashboardMetrics(
  transactions: Transaction[],
  month: string,
  budgetConfig: MonthlyBudgetConfig
): DashboardMetrics {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(month));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  const totalBudget = budgetConfig.totalBudget;
  const budgetRemaining = totalBudget - totalExpenses;
  const budgetUsedPercent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Days in month calculation
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, m, 0).getDate();

  // If current month (2026-09), days elapsed up to 27th or today; else all days
  const isCurrentMonth = month === '2026-09';
  const daysElapsed = isCurrentMonth ? 27 : daysInMonth;
  const dailyAverage = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
  const dailyTargetAllowance = daysInMonth > 0 ? totalBudget / daysInMonth : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    totalBudget,
    budgetRemaining,
    budgetUsedPercent,
    dailyAverage,
    daysInMonth,
    daysElapsed,
    dailyTargetAllowance,
    transactionCount: monthTransactions.length,
  };
}

export function calculateCategorySpending(
  transactions: Transaction[],
  month: string,
  budgetConfig: MonthlyBudgetConfig
): CategorySpending[] {
  const monthExpenses = transactions.filter(
    (t) => t.date.startsWith(month) && t.type === 'expense'
  );

  const totalExpenses = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryTotals: Record<string, { amount: number; count: number }> = {};

  monthExpenses.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = { amount: 0, count: 0 };
    }
    categoryTotals[tx.category].amount += tx.amount;
    categoryTotals[tx.category].count += 1;
  });

  // Ensure all configured budget categories are considered
  const allCategories = Array.from(
    new Set([...Object.keys(budgetConfig.categoryBudgets), ...Object.keys(categoryTotals)])
  ) as ExpenseCategory[];

  const result: CategorySpending[] = allCategories
    .filter((cat) => cat !== 'Income & Salary')
    .map((category) => {
      const spent = categoryTotals[category]?.amount || 0;
      const count = categoryTotals[category]?.count || 0;
      const allocated = budgetConfig.categoryBudgets[category] || 0;
      const variance = allocated - spent; // positive = under budget, negative = over budget
      const percentage = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
      const color = CATEGORY_COLORS[category]?.color || '#64748b';

      return {
        category,
        amount: spent,
        count,
        percentage,
        allocated,
        variance,
        color,
      };
    })
    .sort((a, b) => b.amount - a.amount); // highest spending first

  return result;
}

export interface DaySpending {
  day: number;
  dateStr: string;
  total: number;
  count: number;
}

export function calculateDailySpending(
  transactions: Transaction[],
  month: string
): DaySpending[] {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, m, 0).getDate();

  const dailyMap: Record<number, { total: number; count: number }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = { total: 0, count: 0 };
  }

  transactions
    .filter((t) => t.date.startsWith(month) && t.type === 'expense')
    .forEach((tx) => {
      const dayNum = parseInt(tx.date.split('-')[2], 10);
      if (dailyMap[dayNum]) {
        dailyMap[dayNum].total += tx.amount;
        dailyMap[dayNum].count += 1;
      }
    });

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    return {
      day,
      dateStr: `${month}-${formattedDay}`,
      total: dailyMap[day].total,
      count: dailyMap[day].count,
    };
  });
}

export interface CategoryMultiMonthTrend {
  category: ExpenseCategory;
  currentAmount: number;
  prevAmount: number;
  priorAmount: number;
  momDelta: number; // currentAmount - prevAmount
  momDeltaPercent: number; // percentage
  color: string;
}

export function calculateMultiMonthCategoryTrends(
  transactions: Transaction[],
  currentMonth: string
): {
  trends: CategoryMultiMonthTrend[];
  currentMonthLabel: string;
  prevMonthLabel: string;
  priorMonthLabel: string;
} {
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  // Derive previous 2 months
  const prevDate = new Date(year, m - 2, 1);
  const priorDate = new Date(year, m - 3, 1);

  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const priorMonth = `${priorDate.getFullYear()}-${String(priorDate.getMonth() + 1).padStart(2, '0')}`;

  const formatShortMonth = (ym: string) => {
    const [y, mon] = ym.split('-');
    const d = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
    return d.toLocaleString('en-US', { month: 'short' });
  };

  const currentMonthLabel = formatShortMonth(currentMonth);
  const prevMonthLabel = formatShortMonth(prevMonth);
  const priorMonthLabel = formatShortMonth(priorMonth);

  const currentMap: Record<string, number> = {};
  const prevMap: Record<string, number> = {};
  const priorMap: Record<string, number> = {};

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      if (tx.date.startsWith(currentMonth)) {
        currentMap[tx.category] = (currentMap[tx.category] || 0) + tx.amount;
      } else if (tx.date.startsWith(prevMonth)) {
        prevMap[tx.category] = (prevMap[tx.category] || 0) + tx.amount;
      } else if (tx.date.startsWith(priorMonth)) {
        priorMap[tx.category] = (priorMap[tx.category] || 0) + tx.amount;
      }
    });

  const categories = Object.keys(CATEGORY_COLORS).filter(
    (c) => c !== 'Income & Salary'
  ) as ExpenseCategory[];

  const trends: CategoryMultiMonthTrend[] = categories
    .map((category) => {
      const cur = currentMap[category] || 0;
      const prev = prevMap[category] || 0;
      const prior = priorMap[category] || 0;
      const momDelta = cur - prev;
      const momDeltaPercent = prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0;
      const color = CATEGORY_COLORS[category]?.color || '#64748b';

      return {
        category,
        currentAmount: cur,
        prevAmount: prev,
        priorAmount: prior,
        momDelta,
        momDeltaPercent,
        color,
      };
    })
    .filter((t) => t.currentAmount > 0 || t.prevAmount > 0 || t.priorAmount > 0)
    .sort((a, b) => b.currentAmount - a.currentAmount);

  return {
    trends,
    currentMonthLabel,
    prevMonthLabel,
    priorMonthLabel,
  };
}
