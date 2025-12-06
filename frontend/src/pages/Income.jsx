import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { Download, Wallet, Plus } from "lucide-react";
import Tabs from "../components/Tabs";
import CategoryListTab from "../components/CategoryListTab";
import InsightsTab from "../components/InsightsTab";
import QuickActionsTab from "../components/QuickActionsTab";
import ChartSection from "../components/ChartSection";
import RecentList from "../components/RecentList";
import RightSidebar from "../components/RightSidebar";

const Income = () => {
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
  const [editingIncome, setEditingIncome] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeIdToEdit, setIncomeIdToEdit] = useState(null);
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
      setTotalIncome(res.data.totalIncome); // <- dari backend
      // NOTE: do NOT overwrite `recent` here — `/api/dashboard`'s `latest`
      // does not include `id`, which breaks delete/edit handlers that
      // expect `income.id`. `fetchSummary()` is the source of truth for
      // recent items with `id`.
      // If you need dashboard latest entries with id, update the
      // backend `/api/dashboard` to include `id` in its query.
      // setRecent(res.data.latest); // intentionally omitted
      // can still use other dashboard fields like trxChart, recommendations
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/income/summary");
      setRecent(res.data.recent);
      setDonutChart(res.data.donutChart);
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

      const res = await api.get(`/api/income/overview?${queryParams}`);
      setBarData(res.data.barChart);
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSummary(); // fetch income Source & recent income
    fetchOverview(); // fetch income overview chart
    fetchDashboard(); // fetch total income for balance card
  }, [dateRange]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateRangeChange = (e) => {
    const newDateRange = { ...dateRange, [e.target.name]: e.target.value };
    setDateRange(newDateRange);
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/income", form);
      setForm({ amount: "", category: "", date: "" });
      setShowAddForm(false);
      fetchSummary();
      fetchOverview();
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Gagal menambah income");
    }
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    try {
      // Gunakan editingIncome.id karena editingIncome sudah ter-set saat handleEditIncome dipanggil
      const idToUse = editingIncome?.id;
      if (!idToUse) {
        alert("Error: Income ID tidak ditemukan");
        return;
      }
      console.log("Updating income ID:", idToUse, "with form:", form);
      await api.put(`/api/income/${idToUse}`, form);
      setForm({ amount: "", category: "", date: "" });
      setEditingIncome(null);
      setIncomeIdToEdit(null);
      setShowAddForm(false);
      fetchSummary();
      fetchOverview();
    } catch (error) {
      console.error("Error updating income:", error);
      alert("Gagal mengupdate income");
    }
  };

  const handleDeleteIncome = async (idOrIncome) => {
    // Accept either an id (number|string) or the income object
    const id =
      idOrIncome && typeof idOrIncome === "object" ? idOrIncome.id : idOrIncome;

    if (!id && id !== 0) {
      console.error("handleDeleteIncome called without valid id", idOrIncome);
      alert("ID transaksi tidak ditemukan. Cek console untuk detail.");
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin menghapus income ini?"))
      return;

    try {
      const res = await api.delete(`/api/income/${id}`);
      // If backend returns 200 OK, refresh all relevant data
      if (res && (res.status === 200 || res.status === 204)) {
        // Refresh all views (equivalent to static page loadAll())
        await fetchSummary(); // Update recent list & donutChart
        await fetchOverview(); // Update bar chart
        await fetchDashboard(); // Update totalIncome & stat cards
        console.log("Income deleted successfully", res.data || res.status);
        // optional user feedback
        // alert('Income berhasil dihapus');
      } else {
        console.error("Unexpected delete response", res);
        alert("Gagal menghapus income: response status " + (res && res.status));
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      alert("Gagal menghapus income: " + (serverMessage || error.message));
    }
  };

  const handleEditIncome = (income) => {
    console.log("Editing income object:", income); // Debug
    setEditingIncome(income);

    // Format date yang aman (gunakan waktu lokal untuk menghindari shift timezone)
    let formattedDate = "";
    if (income.isoDate) {
      const d = new Date(income.isoDate); // will be converted to local timezone
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      formattedDate = `${yyyy}-${mm}-${dd}`;
    } else if (income.date) {
      // jika income.date adalah string seperti '23 Nov 2025', parse dan ambil bagian lokal
      const parsed = Date.parse(income.date);
      if (!isNaN(parsed)) {
        const d = new Date(parsed);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        formattedDate = `${yyyy}-${mm}-${dd}`;
      }
    }

    setForm({
      amount: income.amount,
      category: income.category,
      date: formattedDate,
    });
    setShowAddForm(true);
  };

  const handleDownload = async () => {
    try {
      // Download all income data without date range filter
      const response = await api.get(`/api/income/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `income-report-all-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Gagal mengunduh laporan");
    }
  };

  const barChartConfig = {
    labels: barData.map((i) => i.date),
    datasets: [
      {
        label: "Total Income",
        data: barData.map((i) => i.amount),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const totalBalance = recent.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  // Compute average per day (based on totalIncome, not just recent 5 items)
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
  const avgPerDay = daysCount ? totalIncome / daysCount : 0;

  // Top category
  const topCategory =
    donutChart && donutChart.length > 0
      ? donutChart
          .slice()
          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0]
      : null;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 ml-0 md:ml-64">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Income Overview
          </h1>
          <p className="text-gray-600 mb-6">
            Track your earnings over time and analyze your income trends.
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
                setEditingIncome(null);
                setIncomeIdToEdit(null);
                setForm({ amount: "", category: "", date: "" });
              }}
              className="bg-purple-100 hover:bg-purple-200 px-6 py-2 rounded-lg text-purple-700 hover:cursor-pointer transition font-medium flex items-center gap-2"
            >
              <Plus />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Recent Income (using merged components) */}
          <div className="lg:col-span-2 space-y-6">
            <ChartSection
              balanceLabel="Total Income"
              balanceValue={totalIncome}
              BalanceIcon={Wallet}
              accentColor="purple"
              chartData={barData}
              chartTitle="Income Trend"
              chartDatasetLabel="Total Income"
              chartColor="purple"
            />
            <RecentList
              title="Recent Income"
              items={recent}
              onEdit={handleEditIncome}
              onDelete={handleDeleteIncome}
              type="income"
            />
          </div>

          {/* Right Column - Add Income Form and Income Sources (refactored) */}
          <div className="space-y-6">
            {/* Add Income Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 h-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {editingIncome ? "Edit Income" : "Add New Income"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingIncome(null);
                        setIncomeIdToEdit(null);
                        setForm({ amount: "", category: "", date: "" });
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xl hover:cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    onSubmit={
                      editingIncome ? handleUpdateIncome : handleAddIncome
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
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 hover:cursor-pointer text-white py-3 rounded-lg transition font-medium"
                      >
                        {editingIncome ? "Update Income" : "Save Income"}
                      </button>
                      {/* <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingIncome(null);
                          setForm({ amount: "", category: "", date: "" });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition font-medium"
                      >
                        Cancel
                      </button> */}
                    </div>
                  </form>
                </div>
              </div>
            )}

            <RightSidebar
              stats={[
                {
                  label: "Total (shown)",
                  value: `Rp ${Number(totalIncome || 0).toLocaleString(
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
                    <CategoryListTab
                      categories={donutChart}
                      isExpense={false}
                    />
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
                        setEditingIncome(null);
                        setIncomeIdToEdit(null);
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
                    />
                  ),
                },
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Income;
