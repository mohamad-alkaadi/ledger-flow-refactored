import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { Transaction } from "../types/expense";
import {
  getStoredTransactions,
  saveStoredTransactions,
} from "../services/expenseService";
import { fetchFromBackend } from "../utils/apiTools";

interface TransactionsContextType {
  selectedMonth: any;
  setSelectedMonth: any;
  transactions: any;
  setTransactions: any;
  selectedCategory: any;
  setSelectedCategory: any;
  editingTransaction: any;
  setEditingTransaction: any;
  monthTransactions: any;
}
interface TransactionsProviderProps {
  children: ReactNode;
}
const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined,
);

export const TransactionsProvider: React.FC<TransactionsProviderProps> = ({
  children,
}) => {
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredTransactions(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  useEffect(() => {
    fetchFromBackend(selectedMonth, setTransactions, saveStoredTransactions);
  }, [selectedMonth]);

  const value = useMemo(
    () => ({
      selectedMonth,
      setSelectedMonth,
      transactions,
      setTransactions,
      selectedCategory,
      setSelectedCategory,
      editingTransaction,
      setEditingTransaction,
      monthTransactions,
    }),
    [
      selectedMonth,
      transactions,
      selectedCategory,
      editingTransaction,
      monthTransactions,
    ],
  );
  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = (): TransactionsContextType => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within a ThemeProvider");
  }
  return context;
};
