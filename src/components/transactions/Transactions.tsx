import React from "react";
import { TransactionsSummaryCards } from "../TransactionsSummaryCards";
import { TransactionTable } from "../TransactionTable";

const Transactions = ({
  monthTransactions,
  setEditingTransaction,
  setIsAddModalOpen,
  handleExportCSV,
  selectedCategory,
  setSelectedCategory,
  handleEditTransaction,
  handleDeleteTransaction,
}: {
  monthTransactions: any;
  setEditingTransaction: any;
  setIsAddModalOpen: any;
  handleExportCSV: any;
  selectedCategory: any;
  setSelectedCategory: any;
  handleEditTransaction: any;
  handleDeleteTransaction: any;
}) => {
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
        onDeleteTransaction={handleDeleteTransaction}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};

export default Transactions;
