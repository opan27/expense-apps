import React from "react";
import StatCard from "./StatCard";
import Tabs from "./Tabs";

// Generic right sidebar: accept stats array and tabs array so it can be reused
const RightSidebar = ({
  stats = [],
  tabs = [],
  activeTab,
  setActiveTab,
  accentColor = "purple",
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {stats.map((s, idx) => (
          <StatCard
            key={idx}
            label={s.label}
            value={s.value}
            icon={s.icon}
            className={s.className}
            accentColor={accentColor}
          />
        ))}
      </div>

      <div
        className={`rounded-xl shadow-sm p-6 ${
          accentColor === "red"
            ? "bg-gradient-to-br from-red-50 to-white"
            : "bg-gradient-to-br from-purple-50 to-white"
        }`}
      >
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
};

export default RightSidebar;
