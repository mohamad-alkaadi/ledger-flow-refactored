import { Filter, X } from "lucide-react";

const FilteringByHeader = ({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: any;
  setSelectedCategory: any;
}) => {
  return (
    <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 text-xs">
        <Filter className="w-4 h-4 text-emerald-400" />
        <span>
          Filtering views by category:{" "}
          <strong className="underline">{selectedCategory}</strong>
        </span>
      </div>
      <button
        onClick={() => setSelectedCategory(null)}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Clear Filter</span>
      </button>
    </div>
  );
};

export default FilteringByHeader;
