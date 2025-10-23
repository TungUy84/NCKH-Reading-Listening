import React, { useState } from "react";
import { User, Mail, Phone, GraduationCap, School, Layers, BookOpen, Edit, Save, X } from "lucide-react";

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Lê Đặng Thảo Ngọc",
    email: "ngocle@example.com",
    phone: "0987654321",
    faculty: "Công nghệ thông tin",
    major: "Khoa học máy tính",
    course: "K29",
    level: "AV4",
  });

  const faculties = ["Công nghệ thông tin", "Kinh tế", "Ngôn ngữ Anh", "Khoa học xã hội"];
  const majors = ["Khoa học máy tính", "Kỹ thuật phần mềm", "Hệ thống thông tin"];
  const courses = ["Cựu sinh viên","K25","K26", "K27", "K28", "K29", "K30", "K31"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Updated profile:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://via.placeholder.com/120"
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200"
          />
          <button className="mt-3 text-sm text-indigo-600 hover:underline">Change photo</button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <User size={16} /> Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <Mail size={16} /> Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <Phone size={16} /> Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <School size={16} /> Khoa
            </label>
            <select
              name="faculty"
              value={formData.faculty}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            >
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <BookOpen size={16} /> Ngành
            </label>
            <select
              name="major"
              value={formData.major}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            >
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <Layers size={16} /> Khóa
            </label>
            <select
              name="course"
              value={formData.course}
              disabled={!isEditing}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-2 focus:ring-indigo-400 disabled:bg-gray-100"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-1">
              <GraduationCap size={16} /> Trình độ hiện tại
            </label>
            <input
              type="text"
              name="level"
              value={formData.level}
              disabled
              className="mt-1 w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save size={18} /> Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
