import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

const VisitorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/visitor/', { email, password });
      localStorage.setItem('visitorAccessToken', response.data.access);
      navigate('/profile/visitor');
    } catch (err) {
      setSnackbar({ open: true, message: 'Login failed.', severity: 'error' });
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
        <Typography variant="h5" mb={2}>Visitor Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Login
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
