import React, { useState } from "react";
import {
  Box, TextField, Button, Checkbox, FormControlLabel, Typography, Snackbar, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BusinessRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    business_name: "",
    category: "",
    description: "",
    phone: "",
    location: "",
    is_in_jaffa: true,
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

    try {
      const response = await fetch("http://localhost:8000/api/register/business/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          backgroundColor: "rgba(44, 47, 56, 0.9)",
          p: 4,
          borderRadius: 3,
          color: "#fff",
          boxShadow: 5,
        }}
      >
        <Typography variant="h5" mb={3}>
          {t("auth.registerBusiness")}
        </Typography>

        <form onSubmit={handleSubmit}>
          {[
            { name: "username", label: t("register.username") || "Username" },
            { name: "email", label: t("register.email") || "Email", type: "email" },
            { name: "business_name", label: t("register.business_name") || "Business Name" },
            { name: "category", label: t("register.category") || "Category" },
            { name: "description", label: t("register.description") || "Description" },
            { name: "phone", label: t("register.phone") || "Phone" },
            { name: "location", label: t("register.location") || "Location" },
            { name: "password", label: t("register.password") || "Password", type: "password" },
            { name: "password2", label: t("register.confirmPassword") || "Confirm Password", type: "password" },
          ].map(({ name, label, type = "text" }) => (
            <TextField
              key={name}
              name={name}
              type={type}
              label={label}
              value={formData[name]}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#888" },
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
                sx={{ color: "#ccc" }}
              />
            }
            label={<span style={{ color: "#ccc" }}>My business is in Jaffa</span>}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, backgroundColor: "#1976d2" }}>
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
