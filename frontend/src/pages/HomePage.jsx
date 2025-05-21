import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import bg1 from "../assets/bg-hero.jpg";
import bg2 from "../assets/bg-hero2.jpg";
import bg3 from "../assets/bg-hero3.jpg";
import { Rating } from '@mui/material';
import axios from 'axios';

const images = [bg1, bg2, bg3];

const HomePage = () => {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);
  const [toast, setToast] = useState('');
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const message = localStorage.getItem('contactSuccess');
    if (message) {
      setToast(message);
      localStorage.removeItem('contactSuccess');

      setTimeout(() => {
        setToast('');
<<<<<<< HEAD
      }, 5000); 
=======
      }, 5000);
>>>>>>> c2254d5ba6b919fe4a5c830ab05c3d9b7cb99fbc
    }
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/rate-site/')
      .then(res => setRatings(res.data))
      .catch(err => console.error('Failed to load ratings:', err));
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-between relative text-white"
      style={{ backgroundImage: `url(${images[currentImage]})` }}
    >
      {toast && (
        <div className="absolute top-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md animate-bounce z-50">
          {toast}
        </div>
      )}

      <div className="bg-black bg-opacity-60 p-8 rounded-lg text-center max-w-2xl mx-auto mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("home.title")}</h1>
        <p className="text-lg mb-6">{t("home.subtitle")}</p>
        <a
          href="#map"
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {t("home.button")}
        </a>
      </div>

      <div className="bg-white bg-opacity-90 text-black p-6 mt-10 rounded-lg shadow-md w-full max-w-5xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">⭐ {t("The Ratings Of Our Users")}</h2>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {ratings.length === 0 && <p>No ratings yet.</p>}
          {ratings.map((rate) => (
            <div key={rate.id} className="border-b pb-3">
              <Rating value={rate.rating} readOnly size="small" />
              {rate.comment && <p className="text-sm text-gray-800 mt-1">"{rate.comment}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;