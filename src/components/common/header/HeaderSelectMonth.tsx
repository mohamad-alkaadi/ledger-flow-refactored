import { useTransactions } from "@/src/context/TransactionsContext";
import { MONTHS_LIST } from "@/src/data/monthsList";
import { Calendar } from "lucide-react";

const HeaderSelectMonth = () => {
  const { selectedMonth, setSelectedMonth, setSelectedCategory } =
    useTransactions();
  const onMonthChange = (m: any) => {
    setSelectedMonth(m);
    setSelectedCategory(null);
  };
  return (
    <div className="relative inline-flex items-center">
      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="pl-8 pr-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border-0 focus:ring-2 focus:ring-slate-900 cursor-pointer transition-colors"
        aria-label="Select active month"
      >
        {MONTHS_LIST.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default HeaderSelectMonth;
