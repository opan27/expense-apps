import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
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
  Layers,
  AlertCircle,
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
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Installment states
  const [billsSummary, setBillsSummary] = useState(null);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);

  // New states for interactive features
  const [incomeChartType, setIncomeChartType] = useState("doughnut"); // "doughnut" or "bar"
  const [expenseChartType, setExpenseChartType] = useState("bar"); // "doughnut" or "bar"
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
        setRecentTransactions(res.data.latest || []);
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

    const fetchBillsSummary = async () => {
      try {
        const res = await api.get("/api/bills/recommendations");
        setBillsSummary(res.data);
      } catch (error) {
        console.error("Gagal fetch bills summary:", error);
      }
    };

    const fetchUpcomingInstallments = async () => {
      try {
        const res = await api.get("/api/installments/upcoming");
        setUpcomingInstallments(res.data || []);
      } catch (error) {
        console.error("Gagal fetch upcoming installments:", error);
      }
    };

    fetchDashboard();
    fetchIncomeSummary();
    fetchExpenseSummary();
    fetchBillsSummary();
    fetchUpcomingInstallments();
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
            )}`;
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

  // Financial Overview (simple donut)
  const financialOverviewData = {
    labels: ["Balance", "Expense", "Income"],
    datasets: [
      {
        data: [balance, totalExpense, totalIncome],
        backgroundColor: ["#805ad5", "#f56565", "#ed8936"],
        borderWidth: 2,
      },
    ],
  };

  const formatRupiah = (num) => {
    if (!num || isNaN(num)) return "Rp 0";
    return "Rp " + Number(num).toLocaleString("id-ID");
  };

  const formatDateId = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-purple-600">{username}</span>!
            Berikut ringkasan keuangan Anda.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet2 className="w-6 h-6 text-purple-600" />
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Saldo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-purple-600">
              Rp {Math.round(balance).toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Income Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Pemasukan
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Rp {Math.round(totalIncome).toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Pengeluaran
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Rp {Math.round(totalExpense).toLocaleString("id-ID")}
            </h2>
          </div>
        </div>

        {/* Section: Analisis Kategori */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Analisis Kategori
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Pemasukan per Kategori */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Pemasukan per Kategori
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIncomeChartType("doughnut")}
                    className={`p-2 rounded-lg transition-all ${
                      incomeChartType === "doughnut"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Grafik Donat"
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
                    title="Grafik Batang"
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
                  <p className="text-gray-400 text-sm">
                    Belum ada data pemasukan
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Klik segmen untuk melihat detail
              </p>
            </div>

            {/* Pengeluaran per Kategori */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Pengeluaran per Kategori
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpenseChartType("doughnut")}
                    className={`p-2 rounded-lg transition-all ${
                      expenseChartType === "doughnut"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Grafik Donat"
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
                    title="Grafik Batang"
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
                  <p className="text-gray-400 text-sm">
                    Belum ada data pengeluaran
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Klik segmen untuk melihat detail
              </p>
            </div>
          </div>
        </div>

        {/* Section: Ringkasan Keuangan */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Ringkasan Keuangan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Transaksi Terbaru */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Transaksi Terbaru
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktivitas keuangan terkini
                  </p>
                </div>
                <button
                  onClick={() => navigate("/expense")}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <ul className="space-y-2">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((trx, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            trx.type === "income"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {trx.type === "income" ? (
                            <Wallet2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {trx.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateId(trx.date)}
                          </div>
                        </div>
                        <span
                          className={`font-semibold text-sm whitespace-nowrap ${
                            trx.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"}
                          {formatRupiah(trx.amount)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Belum ada transaksi
                      </p>
                    </div>
                  )}
                </ul>
              </div>
            </div>

            {/* Grafik Keuangan */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Grafik Keuangan
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Distribusi keuangan Anda
                </p>
              </div>
              <div className="h-80 flex items-center justify-center">
                {totalIncome > 0 || totalExpense > 0 ? (
                  <Doughnut
                    data={financialOverviewData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 15,
                            font: {
                              size: 12,
                              weight: "bold",
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PieChart className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Cicilan */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Manajemen Cicilan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Ringkasan Cicilan */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    Ringkasan Cicilan
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cicilan bulan ini
                  </p>
                </div>
                <button
                  onClick={() => navigate("/installment")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  Kelola Cicilan
                </button>
              </div>
              <div className="text-xs md:text-sm">
                {billsSummary ? (
                  <div
                    className={`p-4 rounded-lg ${
                      billsSummary.status === "warning"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div
                        className={
                          billsSummary.status === "warning"
                            ? "text-red-700"
                            : "text-gray-700"
                        }
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            Total cicilan bulan ini:
                          </span>
                          <span className="font-semibold text-sm">
                            {formatRupiah(billsSummary.totalMinimum)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            Sisa saldo:
                          </span>
                          <span className="font-semibold text-sm">
                            {formatRupiah(billsSummary.balanceAfterMinimum)}
                          </span>
                        </div>
                      </div>
                      {billsSummary.message && (
                        <div
                          className={`text-xs p-2 rounded-md flex items-start gap-2 ${
                            billsSummary.status === "warning"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {billsSummary.status === "warning" ? (
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="text-base">✓</span>
                          )}
                          <span>{billsSummary.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">Memuat...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cicilan Jatuh Tempo */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Cicilan Jatuh Tempo
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    H-10 sampai hari ini
                  </p>
                </div>
                <button
                  onClick={() => navigate("/installment")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors whitespace-nowrap"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {upcomingInstallments.length > 0 ? (
                  upcomingInstallments.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 mb-1 truncate">
                            {item.name}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-medium">
                              Tgl {item.due_day}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                              {item.remaining_months} bln
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold text-green-700">
                              {formatRupiah(item.monthly_payment)}
                            </span>
                            <span className="text-gray-500">/bulan</span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/expense?installment_id=${item.id}`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          Bayar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Layers className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Tidak ada cicilan jatuh tempo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Aktivitas Terkini */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Aktivitas Terkini
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Pengeluaran Terbaru */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Pengeluaran Terbaru
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktivitas pengeluaran terkini
                  </p>
                </div>
                <button
                  onClick={() => navigate("/expense")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <ul className="space-y-2">
                  {recentExpense.length > 0 ? (
                    recentExpense.map((exp, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        <div className="p-2 bg-red-100 rounded-lg">
                          <CreditCard className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {exp.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateId(exp.date)}
                          </div>
                        </div>
                        <span className="text-red-600 font-semibold text-sm whitespace-nowrap">
                          -{formatRupiah(exp.amount)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-8 h-8 text-red-300" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Belum ada pengeluaran
                      </p>
                    </div>
                  )}
                </ul>
              </div>
            </div>

            {/* Pemasukan Terbaru */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Pemasukan Terbaru
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktivitas pemasukan terkini
                  </p>
                </div>
                <button
                  onClick={() => navigate("/income")}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <ul className="space-y-2">
                  {recentIncome.length > 0 ? (
                    recentIncome.map((inc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Wallet2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {inc.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateId(inc.date)}
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold text-sm whitespace-nowrap">
                          +{formatRupiah(inc.amount)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Wallet2 className="w-8 h-8 text-green-300" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Belum ada pemasukan
                      </p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Rekomendasi */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
              Rekomendasi
            </h2>

            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-200">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Rekomendasi untuk Anda
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Saran belanja cerdas berdasarkan anggaran Anda
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1 truncate group-hover:text-purple-600 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-md inline-block border border-gray-200">
                          {item.category}
                        </p>
                      </div>
                      <span className="text-[10px] bg-green-600 text-white px-2.5 py-1 rounded-md font-semibold ml-2">
                        {item.finalScore}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-purple-600 font-bold text-base">
                            Rp{" "}
                            {Math.round(parseFloat(item.price)).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                          {item.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-500 text-sm">
                                ⭐
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {item.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        {item.distance && (
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
                            📍 {parseFloat(item.distance).toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                      Kategori{" "}
                      {modalType === "income" ? "Pemasukan" : "Pengeluaran"}
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
                    Total Jumlah
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
                    Persentase dari Total{" "}
                    {modalType === "income" ? "Pemasukan" : "Pengeluaran"}
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
                    <p className="text-xs text-gray-600 mb-1">
                      Peringkat Kategori
                    </p>
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
                    <p className="text-xs text-gray-600 mb-1">Total Kategori</p>
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
                    Lihat Halaman{" "}
                    {modalType === "income" ? "Pemasukan" : "Pengeluaran"}
                  </button>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
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
