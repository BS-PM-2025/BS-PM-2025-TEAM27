import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('visitorAccessToken') || localStorage.getItem('access');
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
      navigate('/feed');
    } catch (err) {
      setError('Failed to create post.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
