// import React, { useState } from "react";
// import axios from "axios";
// import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";
// import { validateAuthForm } from "../utils/validators";
// import { API_URL } from "../config/api";
// import InputField from "../components/ui/InputField";

// interface AuthProps {
//   onLogin: (status: boolean) => void;
//   onSetUser: (user: { name: string; email: string } | null) => void;
//   onNavigate: (page: string) => void;
// }

// const Auth: React.FC<AuthProps> = ({ onLogin, onSetUser, onNavigate }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const newErrors = validateAuthForm(formData, isLogin);
//     if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

//     setIsLoading(true);
//     try {
//       const url = `${API_URL}/auth/${isLogin ? "login" : "register"}`;
//       const payload = isLogin
//         ? { email: formData.email, password: formData.password }
//         : { name: formData.name, email: formData.email, password: formData.password };

//       const res = await axios.post(url, payload);

//       if (isLogin) {
//         // ✅ Đăng nhập thành công
//         onLogin(true);
//         onSetUser(res.data.user);
//         onNavigate("home");
//       } else {
//         // ✅ Đăng ký thành công → quay lại login
//         setIsLogin(true);
//         setFormData({ name: "", email: "", password: "", confirmPassword: "" });
//         setErrors({ general: "Đăng ký thành công! Vui lòng đăng nhập." });
//       }
//     } catch (err: any) {
//       setErrors({ general: err.response?.data?.message || "Lỗi kết nối server" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
//       <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 relative">
//         {/* Nút quay lại */}
//         <button
//           onClick={() => onNavigate("welcome")}
//           className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-gray-700"
//         >
//           <ArrowLeft className="w-5 h-5 mr-1" /> Quay lại
//         </button>

//         <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
//           {isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isLogin && (
//             <InputField
//               icon={User}
//               type="text"
//               placeholder="Họ và tên"
//               value={formData.name}
//               onChange={(v) => handleInputChange("name", v)}
//               error={errors.name}
//             />
//           )}

//           <InputField
//             icon={Mail}
//             type="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={(v) => handleInputChange("email", v)}
//             error={errors.email}
//           />

//           <InputField
//             icon={Lock}
//             type={showPassword.password ? "text" : "password"}
//             placeholder="Mật khẩu"
//             value={formData.password}
//             onChange={(v) => handleInputChange("password", v)}
//             error={errors.password}
//             toggleIcon={showPassword.password ? EyeOff : Eye}
//             onToggle={() =>
//               setShowPassword((prev) => ({ ...prev, password: !prev.password }))
//             }
//           />

//           {!isLogin && (
//             <InputField
//               icon={Lock}
//               type={showPassword.confirmPassword ? "text" : "password"}
//               placeholder="Xác nhận mật khẩu"
//               value={formData.confirmPassword}
//               onChange={(v) => handleInputChange("confirmPassword", v)}
//               error={errors.confirmPassword}
//               toggleIcon={showPassword.confirmPassword ? EyeOff : Eye}
//               onToggle={() =>
//                 setShowPassword((prev) => ({
//                   ...prev,
//                   confirmPassword: !prev.confirmPassword,
//                 }))
//               }
//             />
//           )}

//           {/* Hiển thị lỗi / thông báo */}
//           {errors.general && (
//             <div
//               className={`flex items-center text-sm ${
//                 errors.general.includes("thành công")
//                   ? "text-green-600"
//                   : "text-red-600"
//               }`}
//             >
//               <AlertCircle className="w-4 h-4 mr-1" /> {errors.general}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
//           >
//             {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
//           </button>
//         </form>

//         {/* Link chuyển đổi */}
//         <div className="text-center mt-6">
//           <p className="text-gray-600">
//             {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
//             <button
//               type="button"
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-indigo-600 hover:underline"
//             >
//               {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;

import React, { useState } from "react";
import axios from "axios";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/ui/InputField"

// ✅ Thêm API_URL trực tiếp
const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

// ✅ Thêm hàm validate trực tiếp
const validateAuthForm = (formData: any, isLogin: boolean) => {
  const errors: { [key: string]: string } = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.email) errors.email = "Email là bắt buộc";
  else if (!emailRegex.test(formData.email)) errors.email = "Email không hợp lệ";

  if (!formData.password) errors.password = "Mật khẩu là bắt buộc";
  else if (formData.password.length < 6)
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";

  if (!isLogin) {
    if (!formData.name) errors.name = "Họ tên là bắt buộc";
    if (!formData.confirmPassword)
      errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
};

interface AuthProps {
  onLogin: (status: boolean) => void;
  onSetUser: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSetUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ check validate ngay trong file
    const newErrors = validateAuthForm(formData, isLogin);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        onLogin(true);
        onSetUser(res.data.user);
        navigate("/home");
      } else {
        await axios.post(`${API_URL}/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        setErrors({ general: "Đăng ký thành công! Vui lòng đăng nhập." });
        navigate("/login");
      }
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 relative">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Quay lại
        </button>

        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {/* Thông báo lỗi */}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <InputField
              icon={User}
              type="text"
              placeholder="Họ và tên"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
              error={errors.name}
            />
          )}

          <InputField
            icon={Mail}
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            error={errors.email}
          />

          <InputField
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            error={errors.password}
            toggleIcon={showPassword ? EyeOff : Eye}
            onToggle={() => setShowPassword(!showPassword)}
          />

          {!isLogin && (
            <InputField
              icon={Lock}
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={(value) => handleChange("confirmPassword", value)}
              error={errors.confirmPassword}
            />
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Chuyển đổi login/register */}
        <p className="text-center text-gray-600 mt-4">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-500 hover:underline"
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
