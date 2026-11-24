import React from "react";

const CategoryHealthMatrixFooter = ({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: any;
  setSelectedCategory: any;
}) => {
  return (
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
      <span>
        Click any category above to inspect its real-time ledger health
      </span>
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-slate-700 hover:underline font-medium cursor-pointer"
        >
          Clear selection
        </button>
      )}
    </div>
  );
};

export default CategoryHealthMatrixFooter;
