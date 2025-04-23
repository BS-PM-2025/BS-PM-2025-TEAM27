import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VisitorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://127.0.0.1:8000/api";

  const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const refreshToken = async () => {
    const refresh = localStorage.getItem("visitorRefreshToken");
    if (!refresh) return false;

    try {
      const res = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
      localStorage.setItem("visitorAccessToken", res.data.access);
      return res.data.access;
    } catch {
      return false;
    }
  };

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/profile/visitor/`, authHeaders(token));
      setProfile(res.data);
      setPhone(res.data.phone_number || "");
      setPreview(res.data.profile_image_url || "/default-avatar.png");
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) fetchProfile(newToken);
        else navigate("/login/visitor");
      } else {
        console.error("Failed to fetch profile:", err);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("visitorAccessToken");
    if (!token) return navigate("/login/visitor");
    fetchProfile(token);
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("visitorAccessToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("phone_number", phone);
    if (image) formData.append("profile_image", image);

    try {
      const res = await axios.put(`${API_BASE}/profile/visitor/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Profile updated successfully!");
      fetchProfile(token);
    } catch (err) {
      setMessage("❌ Failed to update profile.");
      console.error("Update error:", err.response?.data || err.message);
    }
  };

  if (!profile) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 py-8 bg-white rounded-xl shadow-md border">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={preview || "/default-avatar.png"}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-700">{profile.username}</h1>
          <p className="text-gray-500">📧 {profile.email}</p>
          <p className="text-gray-500">📍 תל אביב - יפו</p>
          <p className="text-gray-500">📅 Joined: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="mt-8 space-y-5">
        {message && (
          <div className={`text-center py-2 px-4 rounded font-semibold ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }}
            className="w-full text-sm file:border file:px-4 file:py-2 file:rounded file:bg-blue-100 file:text-blue-700"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold"
        >
          Update Profile
        </button>
      </form>

      <div className="mt-10 pt-6 border-t">
        <div className="flex space-x-6 text-sm font-semibold text-gray-600">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-1">Posts</button>
          <button className="hover:text-blue-600">Favorites</button>
          <button className="hover:text-blue-600">Reviews</button>
        </div>
        <p className="mt-4 text-sm text-gray-400">No posts to display yet.</p>
      </div>
    </div>
  );
};

export default VisitorProfile;
