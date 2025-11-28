import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { Download, CreditCard, Plus } from "lucide-react";
import Tabs from "../components/Tabs";
import CategoryListTab from "../components/CategoryListTab";
import InsightsTab from "../components/InsightsTab";
import QuickActionsTab from "../components/QuickActionsTab";
import ChartSection from "../components/ChartSection";
import RecentList from "../components/RecentList";
import RightSidebar from "../components/RightSidebar";

const Expense = () => {
  const [username, setUsername] = useState("");
  const [recent, setRecent] = useState([]);
  const [barData, setBarData] = useState([]);
  const [donutChart, setDonutChart] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "", date: "" });
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    const start = startDate.toISOString().slice(0, 10);
    return { start, end };
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseIdToEdit, setExpenseIdToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/income/profile");
      setUsername(res.data.userName);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/dashboard");
      setTotalExpense(res.data.totalExpense);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/expense/summary");
      console.log("Expense Summary Response:", res.data);
      setRecent(res.data.recent || res.data.recentRows || []);
      // Backend expense returns `barChart`, but we use `donutChart` state for categories
      const categories = res.data.donutChart || res.data.barChart || [];
      console.log("Setting donutChart (categories) to:", categories);
      setDonutChart(categories);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchOverview = async () => {
    try {
      const queryParams = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
      }).toString();

      const res = await api.get(`/api/expense/overview?${queryParams}`);
      setBarData(res.data.barChart);
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSummary();
    fetchOverview();
    fetchDashboard();
  }, [dateRange]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateRangeChange = (e) => {
    const newDateRange = { ...dateRange, [e.target.name]: e.target.value };
    setDateRange(newDateRange);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/expense", form);
      setForm({ amount: "", category: "", date: "" });
      setShowAddForm(false);
      fetchSummary();
      fetchOverview();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Gagal menambah expense");
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const idToUse = editingExpense?.id;
      if (!idToUse) {
        alert("Error: Expense ID tidak ditemukan");
        return;
      }
      console.log("Updating expense ID:", idToUse, "with form:", form);
      await api.put(`/api/expense/${idToUse}`, form);
      setForm({ amount: "", category: "", date: "" });
      setEditingExpense(null);
      setExpenseIdToEdit(null);
      setShowAddForm(false);
      fetchSummary();
      fetchOverview();
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Gagal mengupdate expense");
    }
  };

  const handleDeleteExpense = async (idOrExpense) => {
    const id =
      idOrExpense && typeof idOrExpense === "object"
        ? idOrExpense.id
        : idOrExpense;

    if (!id && id !== 0) {
      console.error("handleDeleteExpense called without valid id", idOrExpense);
      alert("ID transaksi tidak ditemukan. Cek console untuk detail.");
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin menghapus expense ini?"))
      return;

    try {
      const res = await api.delete(`/api/expense/${id}`);
      if (res && (res.status === 200 || res.status === 204)) {
        await fetchSummary();
        await fetchOverview();
        await fetchDashboard();
        console.log("Expense deleted successfully", res.data || res.status);
      } else {
        console.error("Unexpected delete response", res);
        alert(
          "Gagal menghapus expense: response status " + (res && res.status)
        );
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      alert("Gagal menghapus expense: " + (serverMessage || error.message));
    }
  };

  const handleEditExpense = (expense) => {
    console.log("Editing expense object:", expense);
    setEditingExpense(expense);

    let formattedDate = "";
    if (expense.isoDate) {
      const d = new Date(expense.isoDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      formattedDate = `${yyyy}-${mm}-${dd}`;
    } else if (expense.date) {
      const parsed = Date.parse(expense.date);
      if (!isNaN(parsed)) {
        const d = new Date(parsed);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        formattedDate = `${yyyy}-${mm}-${dd}`;
      }
    }

    setForm({
      amount: expense.amount,
      category: expense.category,
      date: formattedDate,
    });
    setShowAddForm(true);
  };

  const handleDownload = async () => {
    try {
      const queryParams = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
      }).toString();

      const response = await api.get(`/api/expense/export?${queryParams}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `expense-report-${dateRange.start}-to-${dateRange.end}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Gagal mengunduh laporan");
    }
  };

  const totalBalance = recent.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  const computeDaysInclusive = (startStr, endStr) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const daysCount = computeDaysInclusive(dateRange.start, dateRange.end);
  const avgPerDay = daysCount ? totalExpense / daysCount : 0;

  const topCategory =
    donutChart && donutChart.length > 0
      ? donutChart
          .slice()
          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0]
      : null;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar accentColor="red" />

      <main className="flex-1 p-6 ml-0 md:ml-64">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Expense Overview
          </h1>
          <p className="text-gray-600 mb-6">
            Track your spendings over time and analyze your expense trends.
          </p>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">from</span>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-gray-700">to</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingExpense(null);
                setExpenseIdToEdit(null);
                setForm({ amount: "", category: "", date: "" });
              }}
              className="bg-red-100 hover:bg-red-200 px-6 py-2 rounded-lg text-red-700 hover:cursor-pointer transition font-medium flex items-center gap-2"
            >
              <Plus />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Recent Expenses */}
          <div className="lg:col-span-2 space-y-6">
            <ChartSection
              balanceLabel="Total Expense"
              balanceValue={totalExpense}
              BalanceIcon={CreditCard}
              accentColor="red"
              chartData={barData}
              chartTitle="Expense Trend"
              chartDatasetLabel="Total Expense"
              chartColor="red"
            />
            <RecentList
              title="Recent Expenses"
              items={recent}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              type="expense"
            />
          </div>

          {/* Right Column - Add Expense Form and Stats */}
          <div className="space-y-6">
            {/* Add Expense Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 h-full p-4">
                <div
                  className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {editingExpense ? "Edit Expense" : "Add New Expense"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingExpense(null);
                        setExpenseIdToEdit(null);
                        setForm({ amount: "", category: "", date: "" });
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xl hover:cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    onSubmit={
                      editingExpense ? handleUpdateExpense : handleAddExpense
                    }
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Enter amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        placeholder="Enter category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white py-3 rounded-lg transition font-medium"
                      >
                        {editingExpense ? "Update Expense" : "Save Expense"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <RightSidebar
              stats={[
                {
                  label: "Total (shown)",
                  value: `Rp ${Number(totalExpense || 0).toLocaleString(
                    "id-ID"
                  )}`,
                },
                {
                  label: "Avg per day",
                  value: `Rp ${Number(avgPerDay || 0).toLocaleString("id-ID")}`,
                },
                {
                  label: "Top Category",
                  value: topCategory ? topCategory.category : "-",
                },
              ]}
              tabs={[
                {
                  id: "categories",
                  label: "Categories",
                  content: (
                    <CategoryListTab categories={donutChart} isExpense={true} />
                  ),
                },
                {
                  id: "insights",
                  label: "Insights",
                  content: (
                    <InsightsTab
                      total={totalBalance}
                      avgPerDay={avgPerDay}
                      topCategory={topCategory}
                      daysCount={daysCount}
                      accentColor="red"
                    />
                  ),
                },
                {
                  id: "actions",
                  label: "Quick Actions",
                  content: (
                    <QuickActionsTab
                      onAdd={() => {
                        setShowAddForm(true);
                        setEditingExpense(null);
                        setExpenseIdToEdit(null);
                        setForm({ amount: "", category: "", date: "" });
                      }}
                      onDownload={handleDownload}
                      onFilterPreset={(preset) => {
                        const today = new Date();
                        let start = new Date();
                        if (preset === "7d") start.setDate(today.getDate() - 6);
                        else start.setDate(today.getDate() - 29);
                        setDateRange({
                          start: start.toISOString().slice(0, 10),
                          end: today.toISOString().slice(0, 10),
                        });
                      }}
                      accentColor="red"
                    />
                  ),
                },
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              accentColor="red"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Expense;
