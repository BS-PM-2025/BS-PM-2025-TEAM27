import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const API = 'http://localhost:8000/api';
const user = JSON.parse(localStorage.getItem('user')) || {};

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState({});
  const [openPost, setOpenPost] = useState(null);

  const token =
    localStorage.getItem('visitorAccessToken') ||
    localStorage.getItem('access');
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
      const token = localStorage.getItem('adminAccessToken');
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/posts/${postId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Post deleted.');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleComment = async (id) => {
    if (!commentText[id]) return;
    try {
      await axios.post(
        `${API}/posts/${id}/comment/`,
        { content: commentText[id] },
        { headers }
      );
      setCommentText({ ...commentText, [id]: '' });
      fetchPosts();
    } catch {
      setError('Failed to comment');
    }
  };

  const handleReport = async (id) => {
    const reason = prompt('Please enter a reason for reporting this post:');
    if (!reason) return;
    try {
      await axios.post(`${API}/posts/${id}/report/`, { reason }, { headers });
      alert('Post reported successfully');
    } catch (err) {
      console.error(err.response?.data || err);
      setError('Failed to report post');
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setOpenPost(post)}
            className="rounded-xl overflow-hidden shadow-lg relative cursor-pointer transform transition duration-300 hover:scale-105"
            style={{
              backgroundImage: `url(${post.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: 300,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 right-3 text-white font-semibold text-md text-right">
              {post.title || post.user}
              <br />
              <span className="text-sm">
                {post.date || post.created_at?.split('T')[0]}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-3">
              {(post.is_owner || user?.is_admin) && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    user?.is_admin
                      ? handleAdminDeletePost(post.id)
                      : handleDelete(post.id);
                  }}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(post.id);
                }}
                sx={{ color: 'white' }}
              >
                <FavoriteIcon />
                <span className="ml-1 text-white">{post.likes_count}</span>
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPost(post);
                }}
                sx={{ color: 'white' }}
              >
                <ChatBubbleOutlineIcon />
                <span className="ml-1 text-white">{post.comments_count}</span>
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Dialog */}
      <Dialog
        open={!!openPost}
        onClose={() => setOpenPost(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{openPost?.title || openPost?.user}</DialogTitle>
        <DialogContent>
          <img
            src={openPost?.image}
            alt="Post"
            className="w-full rounded mb-4"
          />
          <p className="mb-4">{openPost?.content}</p>

          <div className="max-h-60 overflow-y-auto mb-4 pr-2">
            {openPost?.comments?.map((comment, i) => (
              <div key={i} className="mb-2 text-sm text-gray-800">
                <strong>{comment.user}</strong>: {comment.content}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText[openPost?.id] || ''}
              onChange={(e) =>
                setCommentText({
                  ...commentText,
                  [openPost.id]: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <Button
              variant="contained"
              onClick={() => handleComment(openPost.id)}
              sx={{ backgroundColor: '#1976d2' }}
            >
              Comment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostFeed;
