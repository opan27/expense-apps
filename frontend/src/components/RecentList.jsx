import React, { useState } from "react";
import { Edit3, Trash2, Eye } from "lucide-react";

// Generic RecentList for transactions; pass `type` to control sign/color
// Merged with RecentItem logic to reduce component count
const RecentList = ({
  items = [],
  onEdit,
  onDelete,
  title = "Recent",
  type = "income",
}) => {
  const isIncome = type === "income";
  const [showAll, setShowAll] = useState(false);

  // Sort items by date (newest first)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // descending order (newest first)
  });

  // Show only 5 items by default, or all if "See All" is clicked
  const displayItems = showAll ? sortedItems : sortedItems.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              isIncome
                ? "text-purple-600 hover:bg-purple-50"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <Eye className="w-4 h-4" />
            {showAll ? "Show Less" : "See All"}
          </button>
        )}
      </div>
      <div className="space-y-4">
        {displayItems && displayItems.length > 0 ? (
          displayItems.map((it) => (
            <div
              key={it.id || `${it.category}-${it.date}`}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{it.category}</div>
                <div className="text-sm text-gray-500">{it.date}</div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div
                  className={`${
                    isIncome
                      ? "text-purple-600 bg-purple-50 px-2 py-1 rounded"
                      : "text-red-600 bg-red-50 px-2 py-1 rounded"
                  } font-semibold`}
                >
                  {isIncome ? "+" : "-"}Rp{" "}
                  {parseFloat(it.amount || 0).toLocaleString("id-ID")}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(it)}
                    className={`p-1 rounded ${
                      isIncome ? "hover:bg-purple-100" : "hover:bg-red-100"
                    }`}
                  >
                    <Edit3
                      className={`w-4 h-4 ${
                        isIncome ? "text-purple-600" : "text-red-600"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => onDelete(it)}
                    className={`p-1 rounded ${
                      isIncome ? "hover:bg-red-100" : "hover:bg-amber-100"
                    }`}
                  >
                    <Trash2
                      className={`w-4 h-4 ${
                        isIncome ? "text-red-500" : "text-amber-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No recent records
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentList;
