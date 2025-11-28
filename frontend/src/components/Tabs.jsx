import React from "react";

export default function Tabs({
  tabs,
  activeTab,
  setActiveTab,
  accentColor = "purple",
}) {
  const activeTextColor =
    accentColor === "red" ? "text-red-600" : "text-purple-600";
  const activeBorderColor =
    accentColor === "red" ? "border-red-600" : "border-purple-600";

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition ${
              activeTab === tab.id
                ? `${activeTextColor} border-b-2 ${activeBorderColor}`
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
