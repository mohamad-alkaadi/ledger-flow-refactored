import { Dispatch, SetStateAction } from "react";

const HeaderLink = ({
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
      className={`capitalize px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
        activeTab === title
          ? "bg-white text-slate-900 shadow-xs"
          : "text-slate-600 hover:text-slate-900 cursor-pointer"
      }`}
    >
      {title}
    </button>
  );
};

export default HeaderLink;
