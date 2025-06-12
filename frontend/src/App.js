import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Navbar from "./components/Navbar";
import VisitorLogin from "./pages/VisitorLogin";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessRegister from "./pages/BusinessRegister";
import VisitorRegister from "./pages/VisitorRegister";
import VisitorProfile from "./pages/VisitorProfile";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import BusinessProfile from './pages/BusinessProfile';
import ContactUs from './pages/ContactUs';
import CreatePost from './pages/CreatePost';
import PostFeed from './pages/PostFeed';
import EditPost from './pages/EditPost';
import VerifySuccess from './pages/VerifySuccess';
import VerifyFailed from './pages/VerifyFailed';
import BusinessDirectory from "./pages/BusinessDirectory";
import SalesPage from './pages/SalesPage';
import AdminDashboard from './pages/AdminDashboard';
import RateSite from './pages/RateSite';
import TelAvivGoogleMap from "./pages/TelAvivGoogleMap"; 
function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = ["ar", "he"].includes(i18n.language) ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
  }, [i18n.language]);

  return (
    <Router>
      <div className="font-sans">
        <Navbar changeLanguage={(lang) => i18n.changeLanguage(lang)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login/visitor" element={<VisitorLogin />} />
          <Route path="/login/business" element={<BusinessLogin />} />
          <Route path="/register/visitor" element={<VisitorRegister />} />
          <Route path="/register/business" element={<BusinessRegister />} />
          <Route path="/profile/visitor" element={<VisitorProfile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="/verify-failed" element={<VerifyFailed />} />
          <Route path="/profile/business" element={<BusinessProfile />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/feed" element={<PostFeed />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="/business-directory" element={<BusinessDirectory />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/rate" element={<RateSite />} />
<         Route path="/tel-aviv-map" element={<TelAvivGoogleMap />} />
</Routes>
      </div>
    </Router>
  );
}

export default App;

