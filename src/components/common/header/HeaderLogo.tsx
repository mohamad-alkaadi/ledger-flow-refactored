import { Wallet } from "lucide-react";
import React from "react";

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
        <Wallet className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          LedgerFlow
        </span>
        <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-600">
          FINANCIAL LEDGER
        </span>
      </div>
    </div>
  );
};

export default HeaderLogo;
