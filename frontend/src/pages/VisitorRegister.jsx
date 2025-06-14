import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../assets/logo-jaffa.png"; 

const VisitorRegister = () => {
  const { t, i18n } = useTranslation();
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
          width: "100%",
          maxWidth: 450,
          backgroundColor: "#fff",
          p: 4,
          borderRadius: 6,
          boxShadow: 6,
          textAlign: "center",
          color: "#1976d2",
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
              variant="outlined"
              InputLabelProps={{ style: { color: "#1976d2" } }}
              InputProps={{
                style: { color: "#000", borderRadius: 25, paddingLeft: 12 },
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

export default VisitorRegister;