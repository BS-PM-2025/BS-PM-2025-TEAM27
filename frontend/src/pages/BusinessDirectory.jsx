import React, { useState, useEffect } from "react";
import api from "../api";
import { Dialog } from "@mui/material";

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState([]);
  const [category, setCategory] = useState("");
  const [openOnSaturday, setOpenOnSaturday] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, [category, openOnSaturday]);

  const fetchBusinesses = async () => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (openOnSaturday) params.append("open_on_saturday", "true");

    try {
      const res = await api.get(`/businesses/approved/?${params}`);
      setBusinesses(res.data);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <select onChange={e => setCategory(e.target.value)} className="p-2 border rounded">
          <option value="">All Categories</option>
          <option value="restaurant">Restaurant</option>
          <option value="attractions">Attractions</option>
          <option value="shop">Shop</option>
          <option value="other">Other</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={openOnSaturday}
            onChange={e => setOpenOnSaturday(e.target.checked)}
          />
          Open on Saturday
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(biz => (
          <div
            key={biz.id}
            onClick={() => setSelectedBusiness(biz)}
            className="cursor-pointer border p-4 rounded shadow hover:shadow-md"
          >
            <img src={biz.profile_image} alt="" className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-semibold text-lg">{biz.business_name}</h3>
            <p className="text-sm text-gray-600">Sun-Thu: {biz.work_time_sun_thu || "Closed"}</p>
          </div>
        ))}
      </div>

      {selectedBusiness && (
        <Dialog open onClose={() => setSelectedBusiness(null)} maxWidth="md" fullWidth>
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">{selectedBusiness.business_name}</h2>
            <img src={selectedBusiness.profile_image} alt="" className="w-full h-60 object-cover rounded" />
            <p><strong>Description:</strong> {selectedBusiness.description}</p>
            <p><strong>Phone:</strong> {selectedBusiness.phone}</p>
            <p><strong>Location:</strong> {selectedBusiness.location}</p>
            <p><strong>Work Time:</strong> Sun-Thu: {selectedBusiness.work_time_sun_thu} | Fri: {selectedBusiness.work_time_fri} | Sat: {selectedBusiness.work_time_sat}</p>
            <div>
              <h4 className="text-lg font-semibold">Sales:</h4>
              {selectedBusiness.sales.length > 0 ? (
                selectedBusiness.sales.map(sale => (
                  <div key={sale.id} className="mb-2">
                    <p className="font-bold">{sale.title}</p>
                    <p>{sale.description}</p>
                  </div>
                ))
              ) : (
                <p>No sales available.</p>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold">Gallery:</h4>
              <div className="flex gap-2 flex-wrap">
                {selectedBusiness.gallery_images.map(img => (
                  <img
                    key={img.id}
                    src={img.image}
                    className="w-20 h-20 rounded cursor-pointer"
                    alt="Gallery"
                    onClick={() => setSelectedImage(img.image)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {selectedImage && (
  <Dialog open onClose={() => setSelectedImage(null)} maxWidth="md">
    <div className="relative p-4 bg-black">
      <img
        src={selectedImage}
        alt="Full View"
        className="max-w-full max-h-[80vh] rounded mx-auto"
      />
      <button
        className="absolute top-2 right-2 text-white text-2xl font-bold"
        onClick={() => setSelectedImage(null)}
      >
        &times;
      </button>
    </div>
  </Dialog>
)}
    </div>
  );
};

export default BusinessDirectory;