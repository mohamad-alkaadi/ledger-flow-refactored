export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Food & Groceries'
  | 'Dining & Coffee'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Entertainment & Subscriptions'
  | 'Healthcare & Wellness'
  | 'Shopping & Retail'
  | 'Travel & Leisure'
  | 'Education & Tech'
  | 'Income & Salary'
  | 'Other';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'digital_wallet';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: 'completed' | 'pending';
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocated: number;
  color: string;
  accentColor: string;
}

export interface MonthlyBudgetConfig {
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  totalBudget: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  dailyAverage: number;
  daysInMonth: number;
  daysElapsed: number;
  dailyTargetAllowance: number;
  transactionCount: number;
}

export interface CategorySpending {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percentage: number;
  allocated: number;
  variance: number; // positive = under budget, negative = over budget
  color: string;
}
