import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Merged BalanceCard + TrendChart into a single ChartSection component
const ChartSection = ({
  balanceLabel = "Total",
  balanceValue = 0,
  BalanceIcon = null,
  accentColor = "green",
  chartData = [],
  chartTitle = "Trend",
  chartDatasetLabel = "Total",
  chartColor = "indigo",
}) => {
  // Improved accent color logic for purple/red/orange
  const accentFrom =
    accentColor === "purple"
      ? "from-purple-100"
      : accentColor === "red"
      ? "from-red-100"
      : accentColor === "orange"
      ? "from-orange-100"
      : accentColor === "green"
      ? "from-green-50"
      : "from-gray-50";
  const accentText =
    accentColor === "purple"
      ? "text-purple-600"
      : accentColor === "red"
      ? "text-red-600"
      : accentColor === "orange"
      ? "text-orange-600"
      : accentColor === "green"
      ? "text-green-600"
      : "text-gray-700";

  const colorMap = {
    indigo: { bg: "rgba(99,102,241,0.8)", border: "rgba(99,102,241,1)" },
    green: { bg: "rgba(34,197,94,0.8)", border: "rgba(34,197,94,1)" },
    purple: { bg: "rgba(126,34,206,0.8)", border: "rgba(126,34,206,1)" },
    red: { bg: "rgba(248,113,113,0.8)", border: "rgba(248,113,113,1)" },
    orange: { bg: "rgba(251,146,60,0.8)", border: "rgba(251,146,60,1)" },
  };

  const chosen = colorMap[chartColor] || colorMap.indigo;
  const labels = (chartData || []).map((d) => d.date);
  const dataset = (chartData || []).map((d) => d.amount);
  // compute max to give some headroom on the y-axis
  const numericData = dataset.map((v) => Number(v) || 0);
  const maxValue = numericData.length ? Math.max(...numericData) : 0;
  const suggestedMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : undefined;

  const config = {
    labels,
    datasets: [
      {
        label: chartDatasetLabel,
        data: dataset,
        backgroundColor: chosen.bg,
        borderColor: chosen.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div
        className={`bg-gradient-to-r ${accentFrom} to-white rounded-xl shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">
              {balanceLabel}
            </h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              Rp {Number(balanceValue || 0).toLocaleString("id-ID")}
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            {BalanceIcon ? (
              <BalanceIcon className={`w-6 h-6 ${accentText}`} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          {chartTitle}
        </h4>
        <div className="h-56">
          {chartData && chartData.length > 0 ? (
            <Bar
              data={config}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    // add visual headroom so bars/lines don't touch the top
                    grace: "15%",
                    suggestedMax,
                    ticks: {
                      callback: (value) =>
                        `Rp ${value.toLocaleString("id-ID")}`,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
