import React, { useState } from 'react';
import { CategorySpending } from '../../types/expense';
import { Filter, PieChart as PieIcon } from 'lucide-react';

interface CategoryPieChartProps {
  categories: CategorySpending[];
  totalExpenses: number;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  totalExpenses,
  selectedCategory,
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategorySpending | null>(null);

  // Active highlighted category (either hovered or selected)
  const activeCategory =
    hoveredCategory ||
    categories.find((c) => c.category === selectedCategory) ||
    null;

  // Filter out zero amount categories
  const nonZeroCategories = categories.filter((c) => c.amount > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Dimensions
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const innerRadius = 66; // Donut thickness

  // Compute angles for slices
  let cumulativeAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = nonZeroCategories.map((item) => {
    const sliceAngle =
      totalExpenses > 0 ? (item.amount / totalExpenses) * 2 * Math.PI : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    // Check if hovered or selected
    const isHovered = activeCategory?.category === item.category;

    // Radius expansion on hover
    const currentRadius = isHovered ? radius + 5 : radius;
    const currentInner = isHovered ? innerRadius - 2 : innerRadius;

    // Coordinates
    const x1 = center + currentRadius * Math.cos(startAngle);
    const y1 = center + currentRadius * Math.sin(startAngle);
    const x2 = center + currentRadius * Math.cos(endAngle);
    const y2 = center + currentRadius * Math.sin(endAngle);

    const x3 = center + currentInner * Math.cos(endAngle);
    const y3 = center + currentInner * Math.sin(endAngle);
    const x4 = center + currentInner * Math.cos(startAngle);
    const y4 = center + currentInner * Math.sin(startAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${currentInner} ${currentInner} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      pathData,
      isHovered,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Spending Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Share by category across this billing cycle
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Filter className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Main Content: SVG Donut Chart + Interactive Details */}
      <div className="py-4 flex flex-col md:flex-row items-center justify-around gap-6">
        {/* SVG Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            className="cursor-pointer select-none"
            viewBox={`0 0 ${size} ${size}`}
          >
            {slices.length === 0 ? (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={radius - innerRadius}
              />
            ) : (
              slices.map((slice) => (
                <path
                  key={slice.category}
                  d={slice.pathData}
                  fill={slice.color}
                  opacity={
                    activeCategory && activeCategory.category !== slice.category
                      ? 0.5
                      : 1
                  }
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-100 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(slice)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() =>
                    onSelectCategory(
                      selectedCategory === slice.category ? null : slice.category
                    )
                  }
                />
              ))
            )}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeCategory ? (
              <>
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[130px]">
                  {activeCategory.category}
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums leading-tight">
                  {formatCurrency(activeCategory.amount)}
                </span>
                <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
                  {activeCategory.percentage.toFixed(1)}% of total
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Total Spent
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums leading-tight">
                  {formatCurrency(totalExpenses)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {nonZeroCategories.length} categories
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category Legend List */}
        <div className="w-full md:max-w-xs space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {nonZeroCategories.map((item) => {
            const isSelected = selectedCategory === item.category;
            const isHovered = activeCategory?.category === item.category;

            return (
              <button
                key={item.category}
                onClick={() =>
                  onSelectCategory(isSelected ? null : item.category)
                }
                onMouseEnter={() => setHoveredCategory(item)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : isHovered
                    ? 'bg-slate-100 text-slate-900'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2 font-mono tabular-nums">
                  <span className={isSelected ? 'text-slate-200' : 'text-slate-500'}>
                    {item.percentage.toFixed(0)}%
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer prompt */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any slice or category to filter transactions</span>
        {selectedCategory && (
          <span className="text-slate-900 font-medium">
            Filtering by: {selectedCategory}
          </span>
        )}
      </div>
    </div>
  );
};
