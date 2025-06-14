import React from "react";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
<div
  className="min-h-screen bg-cover bg-center text-white px-6 py-16"
  style={{ backgroundImage: `url('/images/bg1.jpg')` }}
>      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {t("about.title", "About Jaffa Explorer")}
        </h1>
        <p className="text-lg md:text-xl mb-10 text-gray-300 leading-relaxed">
          {t(
            "about.description",
            "Jaffa Explorer is a digital platform that connects tourists and locals to explore Jaffa-Tel Aviv. Our goal is to highlight attractions, local businesses, cultural events, and create a community that respects both heritage and innovation. We proudly welcome all people – Arabs and Jews – to enjoy and contribute to this shared space."
          )}
        </p>

        <h2 className="text-2xl font-semibold mb-4">
          {t("about.team_heading", "Our Team")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <TeamCard name="Muhammed Bsoul" role="Full Stack Developer" />
          <TeamCard name="Mahmod Sanalla" role="Frontend Developer" />
          <TeamCard name="Duna Masalha" role="Backend Developer" />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">
            {t("about.vision_heading", "Our Vision")}
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            {t(
              "about.vision_text",
              "We believe in equality, accessibility, and showcasing the beautiful diversity of Jaffa. Through technology, we aim to bridge cultures and build connections between communities."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const TeamCard = ({ name, role }) => (
  <div className="bg-[#1e1f3a] rounded-lg p-6 shadow-lg">
    <h3 className="text-xl font-semibold">{name}</h3>
    <p className="text-sm text-gray-400">{role}</p>
  </div>
);

export default AboutUs;
