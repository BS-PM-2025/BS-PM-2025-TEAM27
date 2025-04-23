import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BusinessLogin = () => {
  const { t } = useTranslation();
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
        navigate('/dashboard/business');
      } else {
        const err = await response.json();
        setSnackbar({ open: true, message: err.detail || 'Login failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
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
        p: 2
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: 'rgba(44, 47, 56, 0.9)',
          p: 4,
          borderRadius: 2,
          color: '#fff',
          boxShadow: 3
        }}
      >
        <Typography variant="h5" mb={2}>{t('auth.loginBusiness')}</Typography>

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
              input: { color: '#fff' },
              label: { color: '#ccc' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#888' },
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
              mb: 1,
              input: { color: '#fff' },
              label: { color: '#ccc' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#888' },
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Link to="/forgot-password" style={{ color: '#90caf9', fontSize: '0.9rem', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </Box>

          <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#1976d2' }}>
            {t('auth.login')}
          </Button>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BusinessLogin;
