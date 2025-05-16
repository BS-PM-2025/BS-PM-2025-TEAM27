import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getToken = () => {
    return (
      localStorage.getItem('visitorAccessToken') ||
      localStorage.getItem('businessAccessToken') ||
      localStorage.getItem('access') ||
      null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = getToken();

    if (!token) {
      setError('יש להתחבר כדי לשלוח הודעה.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/contact/',
        { subject, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem('contactSuccess', 'ההודעה נשלחה בהצלחה!');
      navigate('/');
    } catch (err) {
      console.error('Contact submission error:', err);
      setError('שליחת ההודעה נכשלה. ודא שאתה מחובר ונסה שוב.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-xl transition-transform animate-fade-in">
        <h2 className="text-4xl font-bold text-center mb-6 text-blue-700 drop-shadow-sm">צור קשר</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center font-medium shadow">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2">נושא</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="הכנס את נושא ההודעה"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">הודעה</label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="כתוב את ההודעה שלך כאן"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md"
          >
            שלח הודעה
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
