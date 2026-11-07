import { useCallback } from "react";
import { TransactionsSummaryCards } from "../TransactionsSummaryCards";
import { TransactionTable } from "../TransactionTable";
import { useTransactions } from "@/src/context/TransactionsContext";

const Transactions = ({ showToast }: { showToast: any }) => {
  const {
    monthTransactions,
    selectedMonth,
    setEditingTransaction,
    selectedCategory,
    setSelectedCategory,
    setIsAddModalOpen,
  } = useTransactions();
  const handleExportCSV = useCallback(() => {
    const rows = [
      [
        "ID",
        "Date",
        "Type",
        "Category",
        "Merchant",
        "Description",
        "Amount",
        "Payment Method",
        "Notes",
      ],
      ...monthTransactions.map((tx: any) => [
        tx.id,
        tx.date,
        tx.type,
        `"${tx.category}"`,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        tx.paymentMethod,
        `"${(tx.notes || "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LedgerFlow_Expenses_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${monthTransactions.length} transactions to CSV.`);
  }, [monthTransactions, selectedMonth]);

  return (
    <div>
      <TransactionsSummaryCards
        transactions={monthTransactions}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
      />
      <TransactionTable
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showToast={showToast}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    </div>
  );
};

export default Transactions;
