import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddOffer = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const adminToken = localStorage.getItem("adminAccessToken");

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!adminToken) {
        console.warn("⚠️ Admin token missing.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/businesses/approved/", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        setBusinesses(res.data);
      } catch (err) {
        console.error("❌ Error fetching businesses:", err);
      }
    };

    fetchBusinesses();
  }, [adminToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminToken) {
      alert("❌ Admin not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("business", businessId);
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:8000/api/offers/", formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Offer created successfully!");
      setTitle('');
      setDescription('');
      setPrice('');
      setBusinessId('');
      setImage(null);
    } catch (error) {
      console.error("❌ Failed to create offer:", error);
      alert("❌ Failed to create offer.");
    }
  };

return (
  <div
    className="min-h-screen bg-cover bg-center bg-no-repeat py-20 px-4"
    style={{ backgroundImage: `url('/images/bg1.jpg')` }}
  >
    <div className="p-6 max-w-md mx-auto bg-white bg-opacity-90 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Add New Offer</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price in Tokens"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={businessId}
          onChange={e => setBusinessId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Business</option>
          {businesses.map(biz => (
            <option key={biz.id} value={biz.user_id}>
              {biz.business_name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Submit Offer
        </button>
      </form>
    </div>
  </div>
);

};

export default AddOffer;
