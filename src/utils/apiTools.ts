export const fetchFromBackend = async (
  selectedMonth: any,
  setTransactions: any,
  saveStoredTransactions: any,
) => {
  try {
    const res = await fetch(`/api/transactions?month=${selectedMonth}`);
    if (res.ok) {
      const data = await res.json();
      if (data.transactions && data.transactions.length > 0) {
        // Merge or update
        setTransactions((prev: any) => {
          const otherMonths = prev.filter(
            (t: any) => !t.date.startsWith(selectedMonth),
          );
          const combined = [...data.transactions, ...otherMonths];
          saveStoredTransactions(combined);
          return combined;
        });
      }
    }
  } catch {
    // Runs cleanly on local storage
  }
};
