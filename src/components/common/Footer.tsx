import React from "react";

const Footer = ({ handleResetData }: { handleResetData: any }) => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">LedgerFlow</span>
          <span aria-hidden="true">·</span>
          <span>Client-Authoritative Financial Ledger</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span>Fiscal Calendar 2026</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={handleResetData}
            className="hover:text-slate-900 underline"
          >
            Reset Mock Dataset
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
