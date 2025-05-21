import React, { useState, useEffect } from "react";
import { Rating, TextField, Button } from "@mui/material";
import axios from "axios";

const BASE_URL = "http://localhost:8000"; // ✅ Django runs on port 8000

const RateSite = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ratingId, setRatingId] = useState(null);

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
      if (err.response?.status === 401) {
        console.warn("Unauthorized: Please log in.");
      } else if (err.response?.status !== 404 && err.response?.status !== 204) {
        console.error("Failed to fetch rating:", err);
      }
    }
  };

  const submitRating = async () => {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to rate.");
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
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
    }
  };

  useEffect(() => {
    fetchRating();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Rate Our Site</h2>
      <Rating
        name="site-rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
        disabled={submitted}
      />
      <TextField
        label="Leave a comment (optional)"
        multiline
        fullWidth
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitted}
        className="my-4"
      />
      {!submitted && (
        <Button variant="contained" color="primary" onClick={submitRating}>
          Submit
        </Button>
      )}
      {submitted && (
        <p className="text-green-600 mt-2">Thanks for your feedback!</p>
      )}
    </div>
  );
};

export default RateSite;
