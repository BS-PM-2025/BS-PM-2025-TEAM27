import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditPost = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('visitorAccessToken') || localStorage.getItem('access');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/posts/${id}/`, { headers });
        setContent(res.data.content);
      } catch (err) {
        setError('Failed to load post');
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await axios.put(`http://localhost:8000/api/posts/${id}/`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/feed');
    } catch (err) {
      setError('Failed to update post');
    }
  };

  return (
<div
  className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/bg3.jpg')" }}
>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Post</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Edit your post..."
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
          Update Post
        </button>
      </form>
    </div>
  );
};

export default EditPost;
