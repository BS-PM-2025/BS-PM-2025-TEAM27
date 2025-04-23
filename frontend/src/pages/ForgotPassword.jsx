import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/password/forgot/', { email });
      setSnackbar({ open: true, message: 'Reset link sent to your email.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error sending reset link.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, backgroundColor: '#2c2f38', p: 4, borderRadius: 2 }}>
      <Typography variant="h5" mb={2} color="#fff">Forgot Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
        />
        <Button variant="contained" type="submit" fullWidth color="primary">Send Reset Link</Button>
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

export default ForgotPassword;
