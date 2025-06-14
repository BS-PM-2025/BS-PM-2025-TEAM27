import React, { useEffect, useState } from 'react';
import api from '../api';
import { Dialog } from '@mui/material';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchFavorites();
    const adminToken = localStorage.getItem("adminAccessToken");
    setIsAdmin(!!adminToken);
  }, []);

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales/all/');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites/sales/');
      const favoriteSaleIds = res.data.map(item => item.sale);
      setFavorites(favoriteSaleIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    try {
      await api.delete(`/sales/${saleId}/`);
      setSales(prev => prev.filter(s => s.id !== saleId));
      if (selectedSale?.id === saleId) setSelectedSale(null);
    } catch (err) {
      console.error("Error deleting sale:", err);
      alert("Failed to delete sale.");
    }
  };

  const toggleFavorite = async (saleId) => {
    try {
      if (favorites.includes(saleId)) {
        await api.delete(`/favorites/sales/${saleId}/`);
        setFavorites(favorites.filter(id => id !== saleId));
      } else {
        await api.post(`/favorites/sales/`, { sale: saleId });
        setFavorites([...favorites, saleId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center"
      style={{
        backgroundImage: 'url("/images/bg1.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-black bg-opacity-70 p-6 max-w-6xl mx-auto rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-6">All Business Sales</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => (
            <div key={sale.id} className="border rounded shadow p-4 relative bg-[#2c2f38] text-white">
              {sale.image && (
                <img
                  src={sale.image}
                  alt="sale"
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-bold mt-2">{sale.title}</h2>
              <p className="text-sm text-gray-300 italic">by {sale.business_name}</p>
              <p className="text-gray-200 mb-1">{sale.description}</p>
              <p className="text-sm text-gray-400">
                {sale.start_date} - {sale.end_date}
              </p>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => setSelectedSale(sale)}
                  className="text-blue-300 hover:underline"
                >
                  View More
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(sale.id)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    {favorites.includes(sale.id) ? '★ Saved' : '☆ Save'}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSale && (
          <Dialog open onClose={() => setSelectedSale(null)} maxWidth="md" fullWidth>
            <div className="p-6 space-y-3 relative bg-[#2c2f38] text-white">
              {selectedSale.image && (
                <img
                  src={selectedSale.image}
                  alt="Sale"
                  className="w-full h-60 object-cover rounded"
                />
              )}
              <h2 className="text-2xl font-bold">{selectedSale.title}</h2>
              <p className="text-sm italic text-gray-300">by {selectedSale.business_name}</p>
              <p>{selectedSale.description}</p>
              <p className="text-sm text-gray-400">
                {selectedSale.start_date} to {selectedSale.end_date}
              </p>
              {isAdmin && (
                <div className="pt-4">
                  <button
                    onClick={() => handleDeleteSale(selectedSale.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete Sale
                  </button>
                </div>
              )}
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
