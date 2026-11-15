import React, { Dispatch, SetStateAction } from "react";

const HeaderLinkMobile = ({
  title,
  activeTab,
  setActiveTab,
}: {
  title: "overview" | "analytics" | "transactions";
  activeTab: string;
  setActiveTab: Dispatch<
    SetStateAction<"overview" | "analytics" | "transactions">
  >;
}) => {
  return (
    <button
      onClick={() => setActiveTab(title)}
      className={`flex-1 capitalize py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors whitespace-nowrap ${
        activeTab === title
          ? "bg-slate-900 text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {title}
    </button>
  );
};

export default HeaderLinkMobile;
