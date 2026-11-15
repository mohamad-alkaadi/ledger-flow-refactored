import HeaderSelectMonth from "./HeaderSelectMonth";
import HeaderAddTransaction from "./HeaderAddTransaction";
import HeaderBudgetPlan from "./HeaderBudgetPlan";

const HeaderPrimaryActions = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <HeaderSelectMonth />
      <HeaderBudgetPlan />
      <HeaderAddTransaction />
    </div>
  );
};

export default HeaderPrimaryActions;
