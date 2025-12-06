import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { X, Edit3, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const Installment = () => {
  const [installments, setInstallments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [paymentHistory, setPaymentHistory] = useState({});

  const [form, setForm] = useState({
    name: "",
    principal: "",
    interest_rate: "0",
    monthly_payment: "",
    total_months: "",
    start_date: "",
    due_day: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      const res = await api.get("/api/installments");
      setInstallments(res.data);
    } catch (error) {
      console.error("Error fetching installments:", error);
    }
  };

  const toggleHistory = async (instId) => {
    if (expandedHistory[instId]) {
      setExpandedHistory({ ...expandedHistory, [instId]: false });
      return;
    }

    try {
      const res = await api.get(`/api/installments/${instId}/payments`);
      setPaymentHistory({ ...paymentHistory, [instId]: res.data });
      setExpandedHistory({ ...expandedHistory, [instId]: true });
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      principal: Number(form.principal),
      interest_rate: Number(form.interest_rate || 0),
      monthly_payment: Number(form.monthly_payment),
      total_months: Number(form.total_months),
      start_date: form.start_date,
      due_day: Number(form.due_day),
      status: form.status,
      notes: form.notes || null,
    };

    try {
      if (editingId) {
        await api.put(`/api/installments/${editingId}`, payload);
      } else {
        await api.post("/api/installments", payload);
      }
      resetForm();
      loadInstallments();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving installment:", error);
      alert("Gagal menyimpan cicilan");
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await api.get(`/api/installments/${id}`);
      const data = res.data;

      setForm({
        name: data.name,
        principal: data.principal,
        interest_rate: data.interest_rate,
        monthly_payment: data.monthly_payment,
        total_months: data.remaining_months,
        start_date: data.start_date ? data.start_date.slice(0, 10) : "",
        due_day: data.due_day,
        status: data.status,
        notes: data.notes || "",
      });

      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching installment:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus cicilan ini?")) return;

    try {
      await api.delete(`/api/installments/${id}`);
      loadInstallments();
    } catch (error) {
      console.error("Error deleting installment:", error);
      alert("Gagal menghapus cicilan");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      principal: "",
      interest_rate: "0",
      monthly_payment: "",
      total_months: "",
      start_date: "",
      due_day: "",
      status: "active",
      notes: "",
    });
    setEditingId(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const formatRupiah = (num) => {
    if (!num || isNaN(num)) return "Rp 0";
    return "Rp " + Number(num).toLocaleString("id-ID");
  };

  const formatDateId = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar accentColor="purple" />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Kelola Cicilan
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Data cicilan ini akan dipakai untuk rekomendasi pembayaran
                tagihan.
              </p>
            </div>
            <button
              onClick={openModal}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Tambah Cicilan
            </button>
          </div>

          {/* List Cicilan */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-800">
                Daftar Cicilan
              </h2>
            </div>
            <div className="space-y-3">
              {installments && installments.length > 0 ? (
                installments.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Pokok: {formatRupiah(item.principal)} · Sisa{" "}
                          {item.remaining_months} bulan
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Bayar per bulan:{" "}
                          <span className="font-semibold text-green-700">
                            {formatRupiah(item.monthly_payment)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Bunga: {item.interest_rate}% · Jatuh tempo tiap
                          tanggal {item.due_day}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mulai cicilan: {formatDateId(item.start_date)}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-400 mt-2">
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`text-[11px] px-3 py-1 rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-700"
                              : item.status === "closed"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.status}
                        </span>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-xs px-3 py-1 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs px-3 py-1 border border-red-300 rounded text-red-600 hover:bg-red-50 transition"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => toggleHistory(item.id)}
                            className="text-xs px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
                          >
                            Histori
                            {expandedHistory[item.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    {expandedHistory[item.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          Histori Pembayaran:
                        </div>
                        {paymentHistory[item.id] &&
                        paymentHistory[item.id].length > 0 ? (
                          <div className="space-y-2">
                            {paymentHistory[item.id].map((payment, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded"
                              >
                                <span>
                                  {payment.date
                                    ? formatDateId(payment.date)
                                    : "-"}
                                </span>
                                <span className="font-semibold">
                                  {formatRupiah(payment.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Belum ada pembayaran tercatat.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-sm py-8">
                  Belum ada cicilan yang tercatat.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-800">
                {editingId ? "Edit Cicilan" : "Tambah Cicilan"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Nama Cicilan
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kredit HP, KPR, dsb"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Total Pokok (Rp)
                </label>
                <input
                  name="principal"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.principal}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Bunga per Tahun (%)
                </label>
                <input
                  name="interest_rate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.interest_rate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Bayar per Bulan (Rp)
                </label>
                <input
                  name="monthly_payment"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.monthly_payment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Sisa Bulan Cicilan
                </label>
                <input
                  name="total_months"
                  type="number"
                  min="1"
                  step="1"
                  value={form.total_months}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Mulai Cicilan
                </label>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Tanggal Jatuh Tempo (1–31)
                </label>
                <input
                  name="due_day"
                  type="number"
                  min="1"
                  max="31"
                  value={form.due_day}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-gray-600">
                  Deskripsi / Catatan
                </label>
                <input
                  name="notes"
                  type="text"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="opsional, misal: kredit motor 24x, tenor 2 tahun"
                />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Installment;
