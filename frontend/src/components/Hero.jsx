// components/Hero.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import bg from '../assets/bg-hero.jpg';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col justify-center items-center text-white text-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('hero.title')}</h1>
      <p className="text-lg md:text-xl mb-6">{t('hero.subtitle')}</p>
      <button className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 transition">
        {t('hero.button')}
      </button>
    </div>
  );
}
