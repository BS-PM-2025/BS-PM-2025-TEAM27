import React, { useState, useEffect } from "react";
import { Rating, TextField, Button, Snackbar, Alert, Box, Typography } from "@mui/material";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

const RateSite = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ratingId, setRatingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const getToken = () =>
    localStorage.getItem("visitorAccessToken") ||
    localStorage.getItem("businessAccessToken");

  const fetchRating = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/rate-site/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 && res.data) {
        setRating(res.data.rating || 0);
        setComment(res.data.comment || "");
        setRatingId(res.data.id);
        setSubmitted(true);
      }
    } catch (err) {
      if (![401, 404, 204].includes(err.response?.status)) {
        console.error("Failed to fetch rating:", err);
      }
    }
  };

  const submitRating = async () => {
    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: "You must be logged in to rate.", severity: "error" });
      return;
    }

    const url = ratingId
      ? `${BASE_URL}/api/rate-site/${ratingId}/`
      : `${BASE_URL}/api/rate-site/`;
    const method = ratingId ? "put" : "post";

    try {
      const res = await axios({
        method,
        url,
        data: { rating, comment },
        headers: { Authorization: `Bearer ${token}` },
      });

      if ([200, 201].includes(res.status)) {
        setSubmitted(true);
        if (res.data?.id) {
          setRatingId(res.data.id);
        }
        setSnackbar({ open: true, message: "Thanks for your feedback!", severity: "success" });
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      setSnackbar({ open: true, message: "Failed to submit rating.", severity: "error" });
    }
  };

  useEffect(() => {
    fetchRating();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg4.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          backgroundColor: "rgba(44,47,56, 0.95)",
          p: 4,
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <Typography variant="h4" gutterBottom color="#fff" fontWeight="bold">
          Rate Our Site
        </Typography>

        <Typography variant="body1" color="gray" mb={2}>
          We'd love your feedback! ⭐
        </Typography>

        <Rating
          name="site-rating"
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          disabled={submitted}
          size="large"
        />

        <TextField
          label="Leave a comment (optional)"
          multiline
          fullWidth
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitted}
          sx={{
            mt: 3,
            mb: 2,
            input: { color: "#000" },
            label: { color: "#ccc" },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#666' },
              '&:hover fieldset': { borderColor: '#999' },
              '&.Mui-focused fieldset': { borderColor: '#1976d2' },
            },
          }}
        />

        {!submitted && (
          <Button variant="contained" color="primary" fullWidth onClick={submitRating}>
            Submit Rating
          </Button>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RateSite;
