import React, { useState } from "react";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InputField from "../components/ui/InputField";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(res.data.message || "Link đặt lại mật khẩu đã được gửi đến email của bạn.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={() => navigate("/auth")}
          className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Quay lại
        </button>

        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Quên mật khẩu
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(value) => setEmail(value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
