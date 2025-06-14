import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const refreshTokens = async () => {
    const token = localStorage.getItem('visitorAccessToken');
    try {
      const res = await axios.get("http://localhost:8000/api/profile/visitor/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem("visitorTokens", res.data.tokens);
      window.dispatchEvent(new Event("tokensUpdated"));
    } catch (err) {
      console.error("❌ Error refreshing tokens:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('visitorAccessToken');
    if (!token) {
      setError('You must be logged in to post.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:8000/api/posts/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshTokens();         
      navigate('/feed');            
    } catch (err) {
      console.error("❌ Post failed:", err);
      setError('Failed to create post.');
    }
  };

  return (
<div
  className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/bg3.jpg')" }}
>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Post</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded mb-4 h-32 resize-none"
          required
        ></textarea>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4"
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
