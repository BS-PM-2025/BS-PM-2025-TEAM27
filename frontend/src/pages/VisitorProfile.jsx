import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

const VisitorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

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
      setFullName(res.data.full_name || "");
      setAddress(res.data.address || "");
      setPreview(res.data.profile_image_url || "/default-avatar.png");
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) fetchProfile(newToken);
        else navigate("/login/visitor");
      }
    }
  };

  const fetchMyPosts = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/my-posts/`, authHeaders(token));
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  const fetchFavorites = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/profile/visitor/favorite-sales/`, authHeaders(token));
      setFavorites(res.data);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("visitorAccessToken");
    if (!token) return navigate("/login/visitor");
    fetchProfile(token);
    fetchMyPosts(token);
    fetchFavorites(token);
  }, [navigate]);


  
  const handleUnsave = async (saleId) => {
    try {
      const token = localStorage.getItem("visitorAccessToken");
      await axios.delete(`${API_BASE}/favorites/sales/${saleId}/delete/`, authHeaders(token));
      setFavorites(favorites.filter(fav => fav.sale !== saleId));
    } catch (err) {
      console.error("Failed to unsave:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("visitorAccessToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("phone_number", phone);
    formData.append("full_name", fullName);
    formData.append("address", address);
    if (image) formData.append("profile_image", image);

    try {
      await axios.put(`${API_BASE}/profile/visitor/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(token);
    } catch {
      setMessage("❌ Failed to update profile.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("visitorAccessToken");
      await axios.delete(`${API_BASE}/posts/${id}/`, authHeaders(token));
      fetchMyPosts(token);
    } catch {
      alert("Failed to delete post");
    }
  };

  if (!profile) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-12 px-6 py-8 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
        <img
          src={preview || "/default-avatar.png"}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-blue-500"
        />
        <div className="flex-1 text-center md:text-left">
          {isEditing ? (
            <>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-blue-700">{fullName}</h1>
              <p className="text-gray-600">📧 {profile.email}</p>
              <p className="text-gray-500">📍 {address || "יפו - תל אביב"}</p>
              <p className="text-gray-500">📅 Joined: {new Date().toLocaleDateString()}</p>
            </>
          )}
        </div>
        <div className="text-right mt-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:underline"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-x-2">
              <button
                type="submit"
                form="profileForm"
                className="text-green-600 hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFullName(profile.full_name || "");
                  setAddress(profile.address || "");
                  setPhone(profile.phone_number || "");
                  setPreview(profile.profile_image_url || "/default-avatar.png");
                }}
                className="text-red-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <form id="profileForm" onSubmit={handleUpdate} className="mt-6 space-y-5">
          {message && (
            <div
              className={`text-center font-medium ${
                message.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }}
              className="w-full"
            />
          </div>
        </form>
      )}

      <div className="mt-10 pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">📝 My Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts to display yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 font-medium">{post.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-post/${post.id}`)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {post.image && <img src={post.image} alt="Post" className="mt-2 rounded max-h-60" />}
              </div>
            ))}
          </div>
        )}
      </div>
<div className="mt-10 pt-6 border-t">
  <h2 className="text-xl font-semibold text-yellow-600 mb-4 flex items-center gap-2">
    <span>⭐</span> Favorite Sales
  </h2>

  {favorites.length === 0 ? (
    <p className="text-gray-500">No favorite sales yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav) => (
        <div key={fav.id} className="border rounded shadow p-4">
          {fav.sale_details.image && (
            <img src={fav.sale_details.image} alt="sale" className="w-full h-40 object-cover rounded" />
          )}
          <h2 className="text-xl font-bold mt-2">{fav.sale_details.title}</h2>
          <p className="text-gray-600 mb-1">{fav.sale_details.description}</p>
          <p className="text-sm text-gray-500">
            {fav.sale_details.start_date} - {fav.sale_details.end_date}
          </p>
          <button
            onClick={() => handleUnsave(fav.sale)}
            className="text-red-500 hover:underline mt-2"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>

          </div>
    
  );
};

export default VisitorProfile;
