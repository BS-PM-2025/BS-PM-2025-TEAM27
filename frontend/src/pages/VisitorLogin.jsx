import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/logo-jaffa.png';
import axios from 'axios';


const VisitorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const direction = i18n.language === 'he' || i18n.language === 'ar' ? 'rtl' : 'ltr';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/visitor/', { email, password });
      localStorage.setItem('visitorAccessToken', response.data.access);
      navigate('/profile/visitor');
    } catch (err) {
      setSnackbar({ open: true, message: t('auth.loginFailed') || 'Login failed.', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url("/images/bg-login.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        direction: direction,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: '#fff',
          p: 4,
          borderRadius: 6,
          textAlign: 'center',
          boxShadow: 6,
          color: '#1976d2',
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
          {t("auth.visitorLogin") || "Visitor Login"}
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label={t("auth.email") || "Email"}
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              input: { color: '#000' },
              label: { color: '#1976d2' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                '& fieldset': { borderColor: '#1976d2' },
                '&:hover fieldset': { borderColor: '#1565c0' },
                '&.Mui-focused fieldset': { borderColor: '#0d47a1' },
              },
            }}
          />

          <TextField
            label={t("auth.password") || "Password"}
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              input: { color: '#000' },
              label: { color: '#1976d2' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                '& fieldset': { borderColor: '#1976d2' },
                '&:hover fieldset': { borderColor: '#1565c0' },
                '&.Mui-focused fieldset': { borderColor: '#0d47a1' },
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Link to="/forgot-password" style={{ color: '#1976d2', fontSize: '0.9rem', textDecoration: 'none' }}>
              {t("Forgot Password") || "Forgot Password?"}
            </Link>
          </Box>

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
            {t("auth.login") || "Login"}
          </Button>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default VisitorLogin;