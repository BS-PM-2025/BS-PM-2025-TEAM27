import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8000/api';
const user = JSON.parse(localStorage.getItem('user')) || {};

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem('visitorAccessToken') || localStorage.getItem('access');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/posts/`, { headers });
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      await axios.post(`${API}/posts/${id}/like/`, {}, { headers });
      fetchPosts();
    } catch {
      setError('Failed to like post');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/posts/${id}/`, { headers });
      fetchPosts();
    } catch {
      setError('Failed to delete post');
    }
  };

  const handleAdminDeletePost = async (postId) => {
  try {
    const token = localStorage.getItem('adminAccessToken'); // or whatever token key you use
    await axios.delete(`http://127.0.0.1:8000/api/admin/posts/${postId}/delete/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert("Post deleted.");
    fetchPosts(); // re-fetch or remove it from state
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Failed to delete post.");
  }
};


  const handleComment = async (id) => {
    if (!commentText[id]) return;
    try {
      await axios.post(`${API}/posts/${id}/comment/`, { content: commentText[id] }, { headers });
      setCommentText({ ...commentText, [id]: '' });
      fetchPosts();
    } catch {
      setError('Failed to comment');
    }
  };

const handleReport = async (id) => {
  const reason = prompt("Please enter a reason for reporting this post:");
  if (!reason) return;

  try {
    const response = await axios.post(
      `${API}/posts/${id}/report/`,
      { reason },  
      { headers }
    );
    alert('Post reported successfully');
  } catch (err) {
    console.error(err.response?.data || err);
    setError('Failed to report post');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">📸 Community Feed</h2>
        {error && <p className="text-center text-red-500">{error}</p>}

        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-700">{post.user}</h4>
              {(post.is_owner || user?.is_admin) && (
  <div className="flex gap-2">
    {post.is_owner && (
      <button onClick={() => navigate(`/edit-post/${post.id}`)} className="text-sm text-blue-600 hover:underline">Edit</button>
    )}
    <button
      onClick={() =>
        user?.is_admin
          ? handleAdminDeletePost(post.id)
          : handleDelete(post.id)
      }
      className="text-sm text-red-600 hover:underline"
    >
      Delete
    </button>
  </div>
)}
            </div>

            <p className="text-gray-800">{post.content}</p>

            {post.image && (
              <img src={post.image} alt="Post" className="w-full rounded-lg" />
            )}

            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
              <span>❤️ {post.likes_count} Likes</span>
              <span>💬 {post.comments_count} Comments</span>
            </div>

            <div className="flex gap-4 mt-2">
              <button onClick={() => handleLike(post.id)} className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">Like</button>
              <button onClick={() => handleReport(post.id)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Report</button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText[post.id] || ''}
                onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                Comment
              </button>
            </div>

            {post.comments && post.comments.map((comment, index) => (
              <div key={index} className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">{comment.user}:</span> {comment.content}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
