import { useCallback } from "react";
import { TransactionsSummaryCards } from "../TransactionsSummaryCards";
import { TransactionTable } from "../TransactionTable";

const Transactions = ({
  monthTransactions,
  setEditingTransaction,
  setIsAddModalOpen,
  selectedCategory,
  setSelectedCategory,
  handleEditTransaction,
  selectedMonth,
  setTransactions,
  saveStoredTransactions,
  showToast,
}: {
  monthTransactions: any;
  setEditingTransaction: any;
  setIsAddModalOpen: any;
  selectedCategory: any;
  setSelectedCategory: any;
  handleEditTransaction: any;
  selectedMonth: any;
  setTransactions: any;
  saveStoredTransactions: any;
  showToast: any;
}) => {
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
        transactions={monthTransactions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onEditTransaction={handleEditTransaction}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        setTransactions={setTransactions}
        saveStoredTransactions={saveStoredTransactions}
        showToast={showToast}
      />
    </div>
  );
};

export default Transactions;
