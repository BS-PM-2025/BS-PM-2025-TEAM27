import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, CircularProgress, Snackbar,
  Alert, Chip, Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api";

const StyledTableCell = styled(TableCell)(() => ({
  color: '#ffffff',
  backgroundColor: '#1f1f1f',
  fontWeight: 'bold'
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#2c2c2c',
  },
  '&:hover': {
    backgroundColor: '#3a3a3a',
  },
  '& td': {
    color: '#ffffff',
  }
}));

const calculateDaysLeft = (dateStr) => {
  const bannedUntil = new Date(dateStr);
  const now = new Date();
  const diffTime = bannedUntil.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axios.get(`${API_BASE}/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: 'Failed to fetch users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      let url = '';
      let method = 'post';

      switch (action) {
        case 'ban':
          url = `${API_BASE}/admin/users/${userId}/ban/`;
          break;
        case 'unban':
          url = `${API_BASE}/admin/users/${userId}/unban/`;
          break;
        case 'delete':
          url = `${API_BASE}/admin/users/${userId}/delete/`;
          method = 'delete';
          break;
        case 'approve':
          url = `${API_BASE}/admin/business/${userId}/approve/`;
          break;
        case 'decline':
          url = `${API_BASE}/admin/business/${userId}/decline/`;
          break;
        default:
          return;
      }

      await axios({ method, url, headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: `Action '${action}' completed successfully.`, severity: 'success' });
      fetchUsers();
    } catch (error) {
      console.error(`Error performing action '${action}':`, error);
      setSnackbar({ open: true, message: `Failed to perform action '${action}'.`, severity: 'error' });
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#202020', minHeight: '100vh', color: '#fff' }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>

      {loading ? (
        <CircularProgress sx={{ color: '#fff' }} />
      ) : users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a1a' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Username</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Role</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Ban</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const role = user.is_admin ? 'Admin' : user.is_business ? 'Business' : 'Visitor';
                const isBanned = user.is_banned_until && new Date(user.is_banned_until) > new Date();
                const daysLeft = isBanned ? calculateDaysLeft(user.is_banned_until) : 0;
                const isPendingBusiness = user.is_business && !user.is_approved;
                const isInactiveBusiness = user.is_business && !user.is_active;

                return (
                  <StyledTableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                    <Chip label={role} color={
                        role === 'Admin' ? 'secondary' :
                        role === 'Business' ? 'info' :
                        role === 'Visitor' ? 'success' : 'default'
                    } />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      {isBanned ? (
                        <Tooltip title={`Remaining: ${daysLeft}  day(s)`}>
                          <Chip label="Banned" color="error" />
                        </Tooltip>
                      ) : (
                        <Chip label="Not Banned" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isBanned ? (
                        <Button variant="outlined" color="success" size="small" onClick={() => handleAction(user.id, 'unban')} sx={{ mr: 1 }}>
                          Unban
                        </Button>
                      ) : (
                        <Button variant="outlined" color="warning" size="small" onClick={() => handleAction(user.id, 'ban')} sx={{ mr: 1 }}>
                          Ban 30d
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" onClick={() => handleAction(user.id, 'delete')} sx={{ mr: 1 }}>
                        Delete
                      </Button>
                      {(isPendingBusiness || isInactiveBusiness) && (
                        <>
                          <Button variant="outlined" color="primary" size="small" onClick={() => handleAction(user.id, 'approve')} sx={{ mr: 1 }}>
                            Approve
                          </Button>
                          <Button variant="outlined" color="secondary" size="small" onClick={() => handleAction(user.id, 'decline')}>
                            Decline
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
