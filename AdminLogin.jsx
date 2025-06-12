import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Alert
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-jaffa.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/admin/", {
        email,
        password,
      });
      localStorage.setItem("adminAccessToken", res.data.access);
      localStorage.setItem("adminRefreshToken", res.data.refresh);
      localStorage.setItem("userRole", "admin");
      navigate("/admin");
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url("/images/bg-login.jpg")',
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
          maxWidth: 400,
          width: "100%",
          bgcolor: "#fff",
          p: 4,
          borderRadius: 6,
          textAlign: "center",
          boxShadow: 6,
          color: "#1976d2",
        }}
      >
        <Box mb={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={Logo} alt="Jaffa Logo" style={{ height: 80, marginBottom: 10 }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Admin Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              input: { color: "#000" },
              label: { color: "#1976d2" },
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                '& fieldset': { borderColor: '#1976d2' },
                '&:hover fieldset': { borderColor: '#1565c0' },
                '&.Mui-focused fieldset': { borderColor: '#0d47a1' },
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              input: { color: "#000" },
              label: { color: "#1976d2" },
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                '& fieldset': { borderColor: '#1976d2' },
                '&:hover fieldset': { borderColor: '#1565c0' },
                '&.Mui-focused fieldset': { borderColor: '#0d47a1' },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: 25,
              fontWeight: 'bold',
            }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AdminLogin;