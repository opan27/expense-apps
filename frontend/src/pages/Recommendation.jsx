import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { Star } from "lucide-react";

const Recommendation = () => {
  const [balance, setBalance] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [category, setCategory] = useState("all");
  const [infoText, setInfoText] = useState("");

  const fetchRecommendations = async () => {
    try {
      const res = await api.get(`/api/recommendations?category=${category}`);
      setBalance(res.data.balance || 0);
      setRecommendations(res.data.recommendations || []);
      setInfoText(
        `Menampilkan kategori: ${category} — hanya produk dengan harga ≤ saldo kamu.`
      );
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setInfoText("Gagal mengambil rekomendasi dari server.");
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApply = () => {
    fetchRecommendations();
  };

  const formatRupiah = (num) => {
    if (!num || isNaN(num)) return "Rp 0";
    return "Rp " + Number(num).toLocaleString("id-ID");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar accentColor="purple" />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Rekomendasi Produk
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Produk yang harganya di bawah saldo terakhir kamu.
              </p>
              <p className="mt-2 text-sm">
                Saldo kamu:{" "}
                <span className="font-semibold text-green-700">
                  {formatRupiah(balance)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua</option>
                <option value="fashion">Pakaian / Fashion</option>
                <option value="electronics">Elektronik</option>
                <option value="furniture">Furniture</option>
              </select>
              <button
                onClick={handleApply}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
              >
                Terapkan
              </button>
            </div>
          </div>

          {/* Info Text */}
          {infoText && (
            <div className="text-xs text-gray-500 mb-4 bg-purple-50 p-3 rounded-lg">
              {infoText}
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-base leading-tight mb-2 text-gray-800">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {item.category}
                    </div>
                    <div className="text-green-600 font-bold text-lg mb-2">
                      {formatRupiah(item.priceIdr)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-600 font-medium">
                        {item.rating || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                      score: {item.finalScore}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 text-sm py-8">
                Tidak ada produk yang cocok dengan saldo dan kategori ini.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recommendation;
