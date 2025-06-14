import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const accessToken = localStorage.getItem('visitorAccessToken');
  const apiBase = "http://localhost:8000/api";

  useEffect(() => {
    fetchOffers();
    fetchRedemptions();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiBase}/offers/available/`);
      setOffers(res.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const res = await axios.get(`${apiBase}/offers/my-redemptions/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRedemptions(res.data);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const handleRedeem = async (offerId) => {
    try {
      const res = await axios.post(`${apiBase}/offers/${offerId}/redeem/`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMessage(`🎉 Offer redeemed! Your code: ${res.data.code}`);
      fetchRedemptions();
      window.dispatchEvent(new Event("tokensUpdated")); // To refresh token balance in Navbar
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail);
      } else {
        setMessage('Error redeeming offer.');
      }
    }
  };

  const isRedeemed = (offerId) => {
    return redemptions.some((r) => r.offer === offerId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
  className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/bg6.jpg')" }}
>

    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">🎁 Available Offers</h1>
      {message && (
        <div className="bg-blue-800 text-white p-3 rounded mb-5 shadow">{message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-gray-800 text-white p-4 rounded-lg shadow">
            {offer.image && (
              <img
                src={
                  offer.image.startsWith("http")
                    ? offer.image
                    : `http://localhost:8000${offer.image}`
                }
                alt={offer.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}
            <h2 className="text-xl font-semibold mb-1">{offer.title}</h2>
            <p className="text-sm text-yellow-300 mb-1">
  Offered by: {offer.business_name || "Unknown"}
</p>
            <p className="text-sm text-gray-400 mb-2">Created: {formatDate(offer.created_at)}</p>
            <p className="mb-2">{offer.description}</p>
            <p className="mb-2">
              Price: <span className="text-green-400 font-semibold">{offer.price} tokens</span>
            </p>

            {isRedeemed(offer.id) ? (
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded w-full cursor-not-allowed"
                disabled
              >
                Already Redeemed
              </button>
            ) : (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                onClick={() => handleRedeem(offer.id)}
              >
                Redeem Offer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default OffersPage;
