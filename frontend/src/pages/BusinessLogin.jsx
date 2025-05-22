import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/logo-jaffa.png';

const BusinessLogin = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/business/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('businessAccessToken', data.access);
        navigate('/');
      } else {
        const err = await response.json();
        setSnackbar({ open: true, message: err.detail || 'Login failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
  };

  const direction = i18n.language === 'he' || i18n.language === 'ar' ? 'rtl' : 'ltr';

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
        <Box mb={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={Logo} alt="Jaffa Logo" style={{ height: 80, marginBottom: 10 }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          {t('auth.loginBusiness') || "Business Login"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            type="email"
            label={t('auth.email') || 'Email'}
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
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
            name="password"
            type="password"
            label={t('auth.password') || 'Password'}
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
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
              {t('Forgot Password') || 'Forgot Password?'}
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
            {t('auth.login') || 'Login'}
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
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BusinessLogin;
