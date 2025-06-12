import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import bg1 from "../assets/bg-hero.jpg";
import bg2 from "../assets/bg-hero2.jpg";
import bg3 from "../assets/bg-hero3.jpg";
import axios from 'axios';
import { Rating } from "@mui/material";
import { Link } from "react-router-dom";

const images = [bg1, bg2, bg3];

const HomePage = () => {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);
  const [toast, setToast] = useState('');
  const [weather, setWeather] = useState(null);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8000/api/rate-site/public/")
      .then(res => setRatings(res.data.slice(0, 3)))
      .catch(err => console.error("❌ Failed to load ratings", err));
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
      className="min-h-screen bg-cover bg-center relative text-white scroll-smooth"
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
          <Link
  to="/tel-aviv-map"
  className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
>
  {t("home.button")}
</Link>
        </div>
      </div>

      {ratings.length > 0 && (
        <div className="relative z-10 mt-10 bg-black bg-opacity-70 p-6 rounded-lg text-white max-w-2xl w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">⭐ {t("home.recent_ratings", "Recent Site Ratings")}</h2>
          {ratings.map((rate, index) => (
            <div
              key={rate.id || index}
              className="bg-[#1e1f3a] p-4 rounded-lg shadow-md mb-4"
            >
              <Rating value={rate.rating} readOnly size="small" />
              {rate.comment && (
                <p className="text-sm text-gray-300 mt-2">"{rate.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ About Us Section */}
      <div id="about" className="relative z-10 bg-black bg-opacity-80 text-white py-16 px-6 mt-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">{t("about.title", "About Jaffa Explorer")}</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            {t(
              "about.description",
              "Jaffa Explorer is a digital platform that connects tourists and locals to explore Jaffa-Tel Aviv. Our goal is to highlight attractions, local businesses, cultural events, and create a community that respects both heritage and innovation. We proudly welcome all people – Arabs and Jews – to enjoy and contribute to this shared space."
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TeamCard name="Muhammed Bsoul" />
            <TeamCard name="Mahmoud Sanalla" />
            <TeamCard name="Duna Masalha" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamCard = ({ name }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#1e1f3a] rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sm text-gray-400">{t("team.role", "Full Stack Developer")}</p>
    </div>
  );
};

export default HomePage;
