import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  TrendingUp,
  TrendingDown,
  Wallet2,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  X,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // New states for interactive features
  const [incomeChartType, setIncomeChartType] = useState("doughnut"); // "doughnut" or "bar"
  const [expenseChartType, setExpenseChartType] = useState("doughnut");
  const [selectedCategory, setSelectedCategory] = useState(null); // For modal
  const [modalType, setModalType] = useState(""); // "income" or "expense"

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/dashboard");
        setUsername(res.data.userName || "User");
        setTotalIncome(res.data.totalIncome || 0);
        setTotalExpense(res.data.totalExpense || 0);
        setBalance((res.data.totalIncome || 0) - (res.data.totalExpense || 0));
        setRecommendations(res.data.recommendations || []);
      } catch (error) {
        console.error("Gagal fetch dashboard:", error);
      }
    };

    const fetchIncomeSummary = async () => {
      try {
        const res = await api.get("/api/income/summary");
        setRecentIncome((res.data.recent || []).slice(0, 5));
        setIncomeCategories(res.data.donutChart || []);
      } catch (error) {
        console.error("Gagal fetch income summary:", error);
      }
    };

    const fetchExpenseSummary = async () => {
      try {
        const res = await api.get("/api/expense/summary");
        setRecentExpense((res.data.recent || []).slice(0, 5));
        setExpenseCategories(res.data.donutChart || res.data.barChart || []);
      } catch (error) {
        console.error("Gagal fetch expense summary:", error);
      }
    };

    fetchDashboard();
    fetchIncomeSummary();
    fetchExpenseSummary();
  }, []);

  // Chart options with enhanced tooltips and click handler
  const getChartOptions = (type, chartType) => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const categories =
          type === "income" ? incomeCategories : expenseCategories;
        setSelectedCategory(categories[index]);
        setModalType(type);
      }
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: { size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor:
          type === "income"
            ? "rgba(147, 51, 234, 0.5)"
            : "rgba(248, 113, 113, 0.5)",
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function (context) {
            // Ambil nilai langsung dari data array menggunakan index
            const value = context.dataset.data[context.dataIndex];
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            return `${context.label}: Rp ${Math.round(value).toLocaleString(
              "id-ID"
            )} `;
          },
          afterLabel: function (context) {
            const value = context.dataset.data[context.dataIndex];
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            // return `${percentage}% of total ${type}`;
          },
        },
      },
    },
    ...(chartType === "bar" && {
      scales: {
        y: {
          beginAtZero: true,
          grace: "15%",
          ticks: {
            callback: function (value) {
              return "Rp " + value.toLocaleString("id-ID");
            },
          },
        },
      },
    }),
  });

  // Prepare chart data for income categories
  const incomeChartData = {
    labels: incomeCategories.map((c) => c.category),
    datasets: [
      {
        label: "Income Amount",
        data: incomeCategories.map((c) => c.amount),
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(6, 182, 212, 0.8)",
        ],
        borderColor: [
          "rgba(147, 51, 234, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(14, 165, 233, 1)",
          "rgba(6, 182, 212, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // Prepare chart data for expense categories
  const expenseChartData = {
    labels: expenseCategories.map((c) => c.category),
    datasets: [
      {
        label: "Expense Amount",
        data: expenseCategories.map((c) => c.amount),
        backgroundColor: [
          "rgba(248, 113, 113, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(253, 224, 71, 0.8)",
          "rgba(163, 230, 53, 0.8)",
        ],
        borderColor: [
          "rgba(248, 113, 113, 1)",
          "rgba(251, 146, 60, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(253, 224, 71, 1)",
          "rgba(163, 230, 53, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 ml-0 md:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back, {username}! Here's your financial summary.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br rounded-xl shadow-lg p-6 bg-white border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-200 bg-opacity-20 rounded-lg">
                <Wallet2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="p-3 bg-red-100 bg-opacity-20 rounded-lg">
                <DollarSign className="w-8 h-8 opacity-50 text-red-500 " />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Balance</p>
            <h2 className="text-3xl font-bold">
              Rp {Math.round(balance).toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Income Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Income
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Rp {Math.round(totalIncome).toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Expense
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Rp {Math.round(totalExpense).toLocaleString("id-ID")}
            </h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income Categories Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Income by Category
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIncomeChartType("doughnut")}
                  className={`p-2 rounded-lg transition-all ${
                    incomeChartType === "doughnut"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Doughnut Chart"
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIncomeChartType("bar")}
                  className={`p-2 rounded-lg transition-all ${
                    incomeChartType === "bar"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {incomeCategories.length > 0 ? (
                incomeChartType === "doughnut" ? (
                  <Doughnut
                    data={incomeChartData}
                    options={getChartOptions("income", "doughnut")}
                  />
                ) : (
                  <Bar
                    data={incomeChartData}
                    options={getChartOptions("income", "bar")}
                  />
                )
              ) : (
                <p className="text-gray-400">No income data available</p>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Click on any segment to view details
            </p>
          </div>

          {/* Expense Categories Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Expense by Category
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpenseChartType("doughnut")}
                  className={`p-2 rounded-lg transition-all ${
                    expenseChartType === "doughnut"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Doughnut Chart"
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpenseChartType("bar")}
                  className={`p-2 rounded-lg transition-all ${
                    expenseChartType === "bar"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {expenseCategories.length > 0 ? (
                expenseChartType === "doughnut" ? (
                  <Doughnut
                    data={expenseChartData}
                    options={getChartOptions("expense", "doughnut")}
                  />
                ) : (
                  <Bar
                    data={expenseChartData}
                    options={getChartOptions("expense", "bar")}
                  />
                )
              ) : (
                <p className="text-gray-400">No expense data available</p>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Click on any segment to view details
            </p>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 Rekomendasi untuk Anda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {item.finalScore}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-purple-600 font-bold text-sm">
                        Rp{" "}
                        {Math.round(parseFloat(item.price)).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          <span className="text-xs font-medium text-gray-700">
                            {item.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.distance && (
                      <span className="text-xs text-gray-500">
                        {parseFloat(item.distance).toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Income */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Income
            </h3>
            <div className="space-y-3">
              {recentIncome.length > 0 ? (
                recentIncome.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.category}
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <p className="font-semibold text-purple-600">
                      +Rp{" "}
                      {Math.round(parseFloat(item.amount)).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No recent income</p>
              )}
            </div>
          </div>

          {/* Recent Expense */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Expenses
            </h3>
            <div className="space-y-3">
              {recentExpense.length > 0 ? (
                recentExpense.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.category}
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <p className="font-semibold text-red-600">
                      -Rp{" "}
                      {Math.round(parseFloat(item.amount)).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No recent expenses</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Category Details */}
        {selectedCategory && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      modalType === "income" ? "bg-purple-100" : "bg-red-100"
                    }`}
                  >
                    {modalType === "income" ? (
                      <TrendingUp
                        className={`w-6 h-6 ${
                          modalType === "income"
                            ? "text-purple-600"
                            : "text-red-600"
                        }`}
                      />
                    ) : (
                      <TrendingDown
                        className={`w-6 h-6 ${
                          modalType === "income"
                            ? "text-purple-600"
                            : "text-red-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCategory.category}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {modalType} Category
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                {/* Amount */}
                <div
                  className={`p-4 rounded-xl ${
                    modalType === "income"
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Amount
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      modalType === "income"
                        ? "text-purple-600"
                        : "text-red-600"
                    }`}
                  >
                    {modalType === "income" ? "+" : "-"}Rp{" "}
                    {Math.round(
                      parseFloat(selectedCategory.amount)
                    ).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Percentage of Total */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Percentage of Total{" "}
                    {modalType === "income" ? "Income" : "Expense"}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          modalType === "income"
                            ? "bg-purple-600"
                            : "bg-red-600"
                        }`}
                        style={{
                          width: `${
                            (parseFloat(selectedCategory.amount) /
                              (modalType === "income"
                                ? totalIncome
                                : totalExpense)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {(
                        (parseFloat(selectedCategory.amount) /
                          (modalType === "income"
                            ? totalIncome
                            : totalExpense)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Category Rank</p>
                    <p className="text-lg font-bold text-gray-900">
                      #
                      {(modalType === "income"
                        ? incomeCategories
                        : expenseCategories
                      )
                        .sort((a, b) => b.amount - a.amount)
                        .findIndex(
                          (c) => c.category === selectedCategory.category
                        ) + 1}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">
                      Total Categories
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {
                        (modalType === "income"
                          ? incomeCategories
                          : expenseCategories
                        ).length
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      window.location.href =
                        modalType === "income" ? "/income" : "/expense";
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      modalType === "income"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    View {modalType === "income" ? "Income" : "Expense"} Page
                  </button>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
