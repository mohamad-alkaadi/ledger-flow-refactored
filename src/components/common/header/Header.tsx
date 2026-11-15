import { Dispatch, SetStateAction } from "react";
import HeaderLink from "./HeaderLink";
import HeaderLogo from "./HeaderLogo";
import HeaderLinkMobile from "./HeaderLinkMobile";
import HeaderPrimaryActions from "./HeaderPrimaryActions";

export const Header = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: Dispatch<
    SetStateAction<"overview" | "analytics" | "transactions">
  >;
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <HeaderLogo />

          {/* Zone 2: Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <HeaderLink
              title={"overview"}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <HeaderLink
              title={"analytics"}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <HeaderLink
              title={"transactions"}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </nav>
          <HeaderPrimaryActions />
        </div>
        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden items-center justify-between pb-2.5 pt-1 border-t border-slate-100 gap-1 overflow-x-auto">
          <HeaderLinkMobile
            title={"overview"}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <HeaderLinkMobile
            title={"analytics"}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <HeaderLinkMobile
            title={"transactions"}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </header>
  );
};
