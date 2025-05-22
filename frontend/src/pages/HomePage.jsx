import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import bg1 from "../assets/bg-hero.jpg";
import bg2 from "../assets/bg-hero2.jpg";
import bg3 from "../assets/bg-hero3.jpg";
import axios from 'axios';

const images = [bg1, bg2, bg3];

const HomePage = () => {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);
  const [toast, setToast] = useState('');
  const [weather, setWeather] = useState(null);

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
      setTimeout(() => setToast(''), 5000);
    }
  }, []);

  useEffect(() => {
    axios.get("https://api.open-meteo.com/v1/forecast?latitude=32.05&longitude=34.75&current_weather=true")
      .then(res => {
        const weatherData = res.data.current_weather;
        setWeather({
          temp: Math.round(weatherData.temperature),
          icon: "☀️", 
          city: "יפו",
          date: new Date().toLocaleDateString('he-IL'),
        });
      })
      .catch(err => {
        console.error("❌ Failed to load weather", err);
      });
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-white"
      style={{ backgroundImage: `url(${images[currentImage]})` }}
    >
      <div className="absolute inset-0 bg-blue-500 opacity-20 z-0" />

      {weather && (
        <div className="absolute top-4 left-4 bg-white text-black rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50">
          <div className="text-center text-sm leading-tight">
            <div className="font-semibold">{weather.city}</div>
            <div>{weather.date}</div>
          </div>
          <div className="text-xl font-bold">{weather.temp}°</div>
          <div className="text-2xl">{weather.icon}</div>
        </div>
      )}

      {toast && (
        <div className="absolute top-16 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md animate-bounce z-50 left-1/2 transform -translate-x-1/2">
          {toast}
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg text-center max-w-2xl">
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
    </div>
  );
};

export default HomePage;
