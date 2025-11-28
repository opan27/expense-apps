import React from "react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  className = "",
  accentColor = "purple",
}) {
  const bgGradient =
    accentColor === "red"
      ? "bg-gradient-to-br from-red-50 to-red-100"
      : "bg-gradient-to-br from-purple-50 to-purple-100";
  const iconBg = accentColor === "red" ? "bg-red-200" : "bg-purple-200";
  const iconColor = accentColor === "red" ? "text-red-600" : "text-purple-600";

  return (
    <div className={`${bgGradient} rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}
