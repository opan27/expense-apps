import React from "react";
import { Plus, Download, Calendar } from "lucide-react";

export default function QuickActionsTab({
  onAdd,
  onDownload,
  onFilterPreset,
  accentColor = "purple",
}) {
  const buttonColor =
    accentColor === "red"
      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
      : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700";

  const filterBorderColor =
    accentColor === "red"
      ? "hover:border-red-400 hover:bg-red-50"
      : "hover:border-purple-400 hover:bg-purple-50";

  return (
    <div className="space-y-3">
      {/* Main Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAdd}
          className={`flex items-center gap-2 ${buttonColor} text-white py-3 px-4 rounded-lg font-medium transition shadow hover:shadow-lg`}
        >
          <Plus className="w-4 h-4" />
          {accentColor === "red" ? "Add Expense" : "Add Income"}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filter Presets */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase">
          Quick Filters
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterPreset("7d")}
            className={`flex items-center gap-2 bg-white border border-gray-300 ${filterBorderColor} text-gray-700 py-2 px-3 rounded font-medium transition text-sm`}
          >
            <Calendar className="w-3 h-3" />
            Last 7 days
          </button>
          <button
            onClick={() => onFilterPreset("30d")}
            className={`flex items-center gap-2 bg-white border border-gray-300 ${filterBorderColor} text-gray-700 py-2 px-3 rounded font-medium transition text-sm`}
          >
            <Calendar className="w-3 h-3" />
            Last 30 days
          </button>
        </div>
      </div>

      {/* Info */}
    </div>
  );
}
