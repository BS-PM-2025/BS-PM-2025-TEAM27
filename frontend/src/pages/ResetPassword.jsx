import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/api/password/reset/${uidb64}/${token}/`, {
        password,
        password2,
      });
      setSnackbar({ open: true, message: 'Password reset successfully!', severity: 'success' });
      setTimeout(() => navigate('/login/visitor'), 2000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Reset failed. Invalid or expired link.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, backgroundColor: '#2c2f38', p: 4, borderRadius: 2 }}>
      <Typography variant="h5" mb={2} color="#fff">Reset Your Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
        />
        <Button variant="contained" type="submit" fullWidth color="primary">Reset Password</Button>
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
  );
};

export default ResetPassword;
