import React, { useEffect, useState } from "react";
import axios from "axios";

const MyRedemptionsPage = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("visitorAccessToken");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/offers/my-redemptions/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRedemptions(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load redemptions.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div
  className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/bg4.jpg')" }}>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">🎁 My Redeemed Offers</h1>
      {redemptions.length === 0 ? (
        <p className="text-white">You haven't redeemed any offers yet.</p>
      ) : (
        <div className="grid gap-4">
          {redemptions.map((item) => (
            <div key={item.id} className="bg-gray-800 text-white p-4 rounded-lg shadow">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.offer_title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-xl font-semibold">{item.offer_title}</h2>
              <p className="text-sm text-yellow-300 mb-1">Offered by: {item.business_name}</p>
              <p className="text-sm text-green-300">Code: <strong>{item.code}</strong></p>
              <p className="text-sm mb-1">Price: {item.offer_price} Tokens</p>
              <p className="text-sm text-gray-400">
                Redeemed on: {new Date(item.redeemed_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default MyRedemptionsPage;
