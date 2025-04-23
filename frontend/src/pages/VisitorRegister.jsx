import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VisitorRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    password2: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setSnackbar({
        open: true,
        message: t("auth.passwordMismatch") || "Passwords do not match.",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register/visitor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: t("auth.registerSuccess") || "Registered successfully!",
          severity: "success",
        });
        setTimeout(() => navigate("/login/visitor"), 1500);
      } else {
        const data = await response.json();
        const message = data.message || Object.values(data).flat().join(" ");
        setSnackbar({
          open: true,
          message: message || t("register.failed") || "Registration failed.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("register.error") || "A server error occurred.",
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
          maxWidth: 450,
          width: "100%",
          backgroundColor: "rgba(44, 47, 56, 0.9)",
          p: 4,
          borderRadius: 3,
          color: "#fff",
          boxShadow: 6,
        }}
      >
        <Typography variant="h5" mb={3}>
          {t("auth.registerVisitor")}
        </Typography>

        <form onSubmit={handleSubmit}>
          {[
            { name: "username", label: t("register.username") || "Username" },
            { name: "email", label: t("register.email") || "Email", type: "email" },
            { name: "phone_number", label: t("register.phone") || "Phone", type: "tel" },
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
              required
              fullWidth
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: "#1976d2" }}
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

export default VisitorRegister;
