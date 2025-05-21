import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [dir, setDir] = useState("ltr");
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const lang = i18n.language;
    const direction = lang === "ar" || lang === "he" ? "rtl" : "ltr";
    setDir(direction);
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [i18n.language]);

  useEffect(() => {
    const visitorToken = localStorage.getItem("visitorAccessToken");
    const businessToken = localStorage.getItem("businessAccessToken");
    const adminToken = localStorage.getItem("adminAccessToken");

    if (adminToken) {
      setIsAuthenticated(true);
      setUserRole("admin");
    } else if (businessToken) {
      setIsAuthenticated(true);
      setUserRole("business");
    } else if (visitorToken) {
      setIsAuthenticated(true);
      setUserRole("visitor");
    } else {
      setIsAuthenticated(false);
      setUserRole("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole("");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) {
        setShowRegisterDropdown(false);
        setShowLoginDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav dir={dir} className="bg-white shadow-md px-6 py-4 flex justify-between items-center relative z-50">
      <Link to="/" className="text-xl font-bold text-blue-700">
        {t("brand") || "Jaffa Explorer"}
      </Link>

      <ul className="hidden md:flex space-x-6 font-medium">
        <li>
          <Link to="/" className="hover:text-blue-600">{t("nav.home") || "Home"}</Link>
        </li>
        <li><a href="#map" className="hover:text-blue-600">{t("nav.map")}</a></li>
        <li>
          <Link to="/feed" className="hover:text-blue-500">📸 Feed</Link>
        </li>
        {userRole === "visitor" && (
          <li>
            <Link to="/create-post" className="hover:text-green-600">➕ New Post</Link>
          </li>
        )}
        <Link to="/business-directory" className="hover:text-blue-500">
            What we have in Jaffa
        </Link>
        <li><a href="#events" className="hover:text-blue-600">{t("nav.events")}</a></li>
        
        <li>
          <Link to="/sales" className="hover:text-blue-500">
              Sales
          </Link>
        </li>
        <li><a href="#about" className="hover:text-blue-600">{t("nav.about")}</a></li>
        <li>
          <Link to="/contact" className="hover:text-blue-600">
            {t("nav.contact")}
          </Link>
        </li>
        {isAuthenticated && (
  <li>
    <Link to="/rate" className="hover:text-blue-400">
      {t("Rate Us")}
    </Link>
  </li>
)}
      </ul>

      <div className="flex items-center space-x-4">
        {!isAuthenticated ? (
          <>
            {/* Register Dropdown */}
            <div className="relative dropdown">
              <button
                onClick={() => {
                  setShowRegisterDropdown(!showRegisterDropdown);
                  setShowLoginDropdown(false);
                }}
                className="text-blue-700 hover:underline" 
              >
                {t("auth.register")}
              </button>
              {showRegisterDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md border rounded z-50">
                  <Link to="/register/visitor" className="block px-4 py-2 hover:bg-gray-100">
                    {t("auth.registerVisitor")}
                  </Link>
                  <Link to="/register/business" className="block px-4 py-2 hover:bg-gray-100">
                    {t("auth.registerBusiness")}
                  </Link>
                </div>
              )}
            </div>

            {/* Login Dropdown */}
            <div className="relative dropdown">
              <button
                onClick={() => {
                  setShowLoginDropdown(!showLoginDropdown);
                  setShowRegisterDropdown(false);
                }}
                className="text-blue-700 hover:underline"
              >
                {t("auth.login")}
              </button>
              {showLoginDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md border rounded z-50">
                  <Link to="/login/visitor" className="block px-4 py-2 hover:bg-gray-100">
                    {t("auth.loginVisitor")}
                  </Link>
                  <Link to="/login/business" className="block px-4 py-2 hover:bg-gray-100">
                    {t("auth.loginBusiness")}
                  </Link>
                  <Link to="/login/admin" className="block px-4 py-2 hover:bg-gray-100 text-red-600">
                    Admin Login
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Authenticated user profile link */}
            {userRole === "admin" && (
  <>
    <Link to="/admin" className="text-blue-700 hover:underline">
      Admin Panel
    </Link>
    <Link to="/admin-dashboard" className="text-green-700 hover:underline ml-4">
      Admin Dashboard
    </Link>
  </>
)}
            {userRole === "business" && (
              <Link to="/profile/business" className="text-blue-700 hover:underline">
                Business Profile
              </Link>
            )}
            {userRole === "visitor" && (
              <Link to="/profile/visitor" className="text-blue-700 hover:underline">
                {t("Profile") || "Visitor Profile"}
              </Link>
            )}

            <button onClick={handleLogout} className="text-red-600 hover:underline">
              {t("Logout") || "Logout"}
            </button>
          </>
        )}

        {/* Language Switch */}
        <div className="space-x-1 text-sm">
          <button onClick={() => changeLanguage("en")}>EN</button>
          <button onClick={() => changeLanguage("he")}>HE</button>
          <button onClick={() => changeLanguage("ar")}>AR</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
