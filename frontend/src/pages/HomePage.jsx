import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import bg1 from "../assets/bg-hero.jpg";
import bg2 from "../assets/bg-hero2.jpg";
import bg3 from "../assets/bg-hero3.jpg";

const images = [bg1, bg2, bg3];

const HomePage = () => {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);
  const [toast, setToast] = useState('');

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
      }, 5000); 
    }
  }, []);

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center relative text-white"
      style={{ backgroundImage: `url(${images[currentImage]})` }}
    >
      {toast && (
        <div className="absolute top-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md animate-bounce z-50">
          {toast}
        </div>
      )}

      <div className="bg-black bg-opacity-60 p-8 rounded-lg text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("home.title")}</h1>
        <p className="text-lg mb-6">{t("home.subtitle")}</p>
        <a
          href="#map"
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {t("home.button")}
        </a>
      </div>
    </div>
  );
};

export default HomePage;