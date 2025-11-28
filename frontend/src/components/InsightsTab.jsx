import React from "react";
import { TrendingUp, Target, Zap } from "lucide-react";

export default function InsightsTab({
  total = 0,
  avgPerDay = 0,
  topCategory = null,
  daysCount = 1,
  accentColor = "purple",
}) {
  const insights = [];

  if (total > 0) {
    insights.push({
      id: 1,
      icon: Target,
      title: accentColor === "red" ? "Total Expense" : "Total Income",
      description: `Anda telah mengumpulkan Rp ${total.toLocaleString(
        "id-ID"
      )} selama ${daysCount} hari.`,
      color: accentColor,
    });
  }

  if (avgPerDay > 0) {
    const trend = avgPerDay > 100000 ? "📈 Bagus!" : "📉 Bisa ditingkatkan";
    insights.push({
      id: 2,
      icon: TrendingUp,
      title: "Rata-rata per Hari",
      description: `Rp ${avgPerDay.toLocaleString("id-ID")}/hari.`,
      color: "blue",
    });
  }

  if (topCategory) {
    insights.push({
      id: 3,
      icon: Zap,
      title: "Top Category",
      description: `${
        topCategory.category
      } menjadi sumber utama dengan Rp ${parseFloat(
        topCategory.amount
      ).toLocaleString("id-ID")}.`,
      color: "amber",
    });
  }

  return (
    <div className="space-y-3">
      {insights.length > 0 ? (
        insights.map((insight) => {
          const Icon = insight.icon;
          const colorClass =
            {
              purple: "bg-purple-50 border-l-4 border-purple-500",
              red: "bg-red-50 border-l-4 border-red-500",
              blue: "bg-blue-50 border-l-4 border-blue-500",
              amber: "bg-amber-50 border-l-4 border-amber-500",
              orange: "bg-orange-50 border-l-4 border-orange-500",
              teal: "bg-teal-50 border-l-4 border-teal-500",
              gray: "bg-gray-50 border-l-4 border-gray-400",
            }[insight.color] || "bg-white border-l-4 border-gray-200";

          return (
            <div
              key={insight.id}
              className={`p-3 rounded ${colorClass} shadow-sm`}
            >
              <div className="flex gap-3">
                <Icon className="w-5 h-5 text-gray-700 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No insights available yet</p>
      )}
    </div>
  );
}
