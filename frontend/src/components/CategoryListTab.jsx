import React, { useMemo, useState } from "react";

export default function CategoryListTab({
  categories = [],
  isExpense = false,
}) {
  const [sortDir, setSortDir] = useState("desc");

  console.log(
    "CategoryListTab received categories:",
    categories,
    "isExpense:",
    isExpense
  );

  const total = useMemo(
    () => categories.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0),
    [categories]
  );

  const sorted = useMemo(() => {
    const copy = (categories || []).slice();
    copy.sort((a, b) => {
      const na = parseFloat(a.amount || 0);
      const nb = parseFloat(b.amount || 0);
      return sortDir === "desc" ? nb - na : na - nb;
    });
    return copy;
  }, [categories, sortDir]);

  const toggleSort = () => setSortDir((s) => (s === "desc" ? "asc" : "desc"));

  const barColor = isExpense
    ? "from-red-500 to-red-600"
    : "from-purple-500 to-purple-600";
  const barHoverColor = isExpense
    ? "group-hover:from-red-600 group-hover:to-red-700"
    : "group-hover:from-purple-600 group-hover:to-purple-700";
  const textColor = isExpense ? "text-red-600" : "text-purple-600";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Categories</p>
        <button
          onClick={toggleSort}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md text-gray-700"
          title="Toggle sort"
        >
          Sort: {sortDir === "desc" ? "Largest" : "Smallest"}
        </button>
      </div>

      {sorted.length > 0 ? (
        sorted.map((category, idx) => {
          const percentage =
            total > 0
              ? ((parseFloat(category.amount) / total) * 100).toFixed(1)
              : 0;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800">
                  {category.category}
                </p>
                <div className="flex gap-2 items-center">
                  <p className={`text-sm font-semibold ${textColor}`}>
                    Rp {parseFloat(category.amount).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-300 ${barHoverColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No category data available</p>
      )}
    </div>
  );
}
