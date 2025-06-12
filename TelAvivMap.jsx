import React, { useEffect, useState } from "react";
import {
  FaHospital,
  FaParking,
  FaUtensils,
  FaUmbrellaBeach,
  FaLandmark,
  FaCar,
  FaHotel,
} from "react-icons/fa";

const center = { lat: 32.0554, lng: 34.7610 };
const radius = 3000;

const typeOptions = [
  { value: "hospital", label: "Hospitals", icon: <FaHospital /> },
  { value: "parking", label: "Parkings", icon: <FaParking /> },
  { value: "restaurant", label: "Restaurants", icon: <FaUtensils /> },
  { value: "beach", label: "Beaches", icon: <FaUmbrellaBeach /> },
  { value: "tourist_attraction", label: "Attractions", icon: <FaLandmark /> },
  { value: "car_rental", label: "Car Rentals", icon: <FaCar /> },
  { value: "lodging", label: "Hotels", icon: <FaHotel /> },
];

const TelAvivMap = () => {
  const [selectedType, setSelectedType] = useState("hospital");
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    window.initMap = () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center,
        zoom: 14,
      });
      setMapInstance(map);
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyD-uTo1k2UaJAjahyWANfU21U8661-y0NY&libraries=places&callback=initMap";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      window.initMap();
    }
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    // Clear previous markers
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    const service = new window.google.maps.places.PlacesService(mapInstance);

    const request =
      selectedType === "beach"
        ? {
            location: center,
            radius,
            type: "natural_feature",
            keyword: "beach",
          }
        : {
            location: center,
            radius,
            type: selectedType,
          };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const newMarkers = results.map((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstance,
            title: place.name,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family: Arial; padding: 5px;">
                <strong>${place.name}</strong><br/>
                ${place.vicinity || "No address available"}
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
          });

          return marker;
        });

        setMarkers(newMarkers);
      } else {
        console.error("Google Places API error:", status);
      }
    });
  }, [selectedType, mapInstance]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-2 text-gray-900">
        <span role="img" aria-label="map">🗺️</span> Tel Aviv-Jaffa Map
      </h1>

      <div className="bg-white p-4 rounded shadow mb-4 flex items-center gap-3">
        <label htmlFor="type" className="font-medium text-gray-700">
          Filter by:
        </label>
        <select
          id="type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 border rounded-md shadow-sm text-gray-800"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        id="map"
        style={{
          height: "80vh",
          width: "100%",
          borderRadius: "8px",
          border: "2px solid #ccc",
        }}
      ></div>
    </div>
  );
};

export default TelAvivMap;
