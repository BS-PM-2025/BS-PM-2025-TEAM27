import React, { useState } from "react";
import {
  Box, TextField, Button, Checkbox, FormControlLabel,
  Typography, Snackbar, Alert, MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../assets/logo-jaffa.png";

const BusinessRegister = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const [formData, setFormData] = useState({
    username: "", email: "", password: "", password2: "",
    business_name: "", category: "", custom_category: "",
    description: "", phone: "", location: "", is_in_jaffa: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setSnackbar({
        open: true,
        message: t("register.error") || "Passwords do not match.",
        severity: "error",
      });
      return;
    }

    const payload = { ...formData };
    if (formData.category !== "other") delete payload.custom_category;

    try {
      const response = await fetch("http://localhost:8000/api/register/business/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "✅ Business registered! Awaiting admin approval.",
          severity: "success",
        });
        setTimeout(() => navigate("/login/business"), 2000);
      } else {
        const messages = Object.values(data).flat().join(" ");
        setSnackbar({
          open: true,
          message: messages || t("register.failed") || "Registration failed.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: t("register.error") || "Server error. Please try again.",
        severity: "error",
      });
    }
  };

  const direction = i18n.language === "ar" || i18n.language === "he" ? "rtl" : "ltr";

  return (
    <Box
      sx={{
        backgroundImage: 'url("/images/bk-reg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        direction: direction,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          backgroundColor: "#fff",
          p: 4,
          borderRadius: 6,
          textAlign: "center",
          color: "#1976d2",
          boxShadow: 6,
        }}
      >
        <Box
  mb={2}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <img src={Logo} alt="Jaffa Logo" style={{ height: 80, marginBottom: 6 }} />
</Box>


        <Typography variant="h5" fontWeight="bold" mb={2}>
          {t("auth.registerBusiness")}
        </Typography>

        <form onSubmit={handleSubmit}>
          {["username", "email", "business_name"].map((name) => (
            <TextField
              key={name}
              name={name}
              label={t(name) || name}
              value={formData[name]}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: "#1976d2" } }}
              InputProps={{
                style: { borderRadius: 25, color: "#000", paddingLeft: 12 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#1565c0" },
                  "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                },
              }}
            />
          ))}

          <TextField
            select
            name="category"
            label={t("category") || "Category"}
            value={formData.category}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{ style: { color: "#1976d2" } }}
            InputProps={{
              style: { borderRadius: 25, color: "#000", paddingLeft: 12 },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#1565c0" },
                "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
              },
            }}
          >
            <MenuItem value="restaurant">{t("restaurant") || "Restaurant"}</MenuItem>
            <MenuItem value="attractions">{t("attractions") || "Attractions"}</MenuItem>
            <MenuItem value="shop">{t("shop") || "Shop"}</MenuItem>
            <MenuItem value="other">{t("other") || "Other"}</MenuItem>
          </TextField>

          {formData.category === "other" && (
            <TextField
              name="custom_category"
              label={t("customCategory") || "Custom Category"}
              value={formData.custom_category}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: "#1976d2" } }}
              InputProps={{
                style: { borderRadius: 25, color: "#000", paddingLeft: 12 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#1565c0" },
                  "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                },
              }}
            />
          )}

          {["description", "phone", "location", "password", "password2"].map((name) => (
            <TextField
              key={name}
              name={name}
              label={t(name) || name}
              type={name.includes("password") ? "password" : "text"}
              value={formData[name]}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: "#1976d2" } }}
              InputProps={{
                style: { borderRadius: 25, color: "#000", paddingLeft: 12 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#1565c0" },
                  "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                },
              }}
            />
          ))}

          <FormControlLabel
            control={
              <Checkbox
                name="is_in_jaffa"
                checked={formData.is_in_jaffa}
                onChange={handleChange}
                sx={{ color: "#1976d2" }}
              />
            }
            label={<span style={{ color: "#1976d2" }}>{t("inJaffa") || "My business is in Jaffa"}</span>}
            sx={{ display: "block", textAlign: "left", mt: 1 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              borderRadius: 25,
              backgroundColor: "#1976d2",
              fontWeight: "bold",
            }}
          >
            {t("auth.register")}
          </Button>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BusinessRegister;