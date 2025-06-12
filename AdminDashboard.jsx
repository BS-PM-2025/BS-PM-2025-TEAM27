// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin-dashboard/')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to fetch dashboard stats:', err));
  }, []);

  if (!stats) return <div className="text-center p-6">Loading...</div>;

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'bg-blue-100 text-blue-800' },
    { label: 'Total Visitors', value: stats.total_visitors, icon: '🧍‍♂️', color: 'bg-green-100 text-green-800' },
    { label: 'Total Businesses', value: stats.total_businesses, icon: '🏪', color: 'bg-purple-100 text-purple-800' },
    { label: 'Total Sales', value: stats.total_sales, icon: '🔥', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Total Favorites', value: stats.total_favorites, icon: '💾', color: 'bg-pink-100 text-pink-800' },
    { label: 'Total Posts', value: stats.total_posts, icon: '📝', color: 'bg-indigo-100 text-indigo-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">📊 Site Statistics</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div key={idx} className={`p-5 rounded-xl shadow-md ${card.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{card.icon}</span>
                  <div className="text-right">
                    <p className="text-lg font-medium">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
