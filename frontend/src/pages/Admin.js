import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css'; // Import custom styles
import Spinner from '../components/Spinner'; // Import custom spinner component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingForum, setEditingForum] = useState(null);
  const [updatedNote, setUpdatedNote] = useState('');
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedImages, setUpdatedImages] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Track login state

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token:", token);  // Debugging token in localStorage
    if (token) {
      setIsLoggedIn(true);  // User is logged in if a token exists
    }

    const fetchForums = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/forums`);
        setForums(response.data);
      } catch (err) {
        setError('Error fetching forums');
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  const handleEditClick = (forum) => {
    setEditingForum(forum);
    setUpdatedNote(forum.note);
    setUpdatedTitle(forum.title);  // Set the title for editing
    setUpdatedImages(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to update this post?');
    if (!confirmed) return;

    const formData = new FormData();
    formData.append('note', updatedNote);
    formData.append('title', updatedTitle);  // Include updated title
    if (updatedImages) {
      for (let i = 0; i < updatedImages.length; i++) {
        formData.append('images', updatedImages[i]);
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token'); // Include authorization if needed
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/forums/${editingForum._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setForums((prevForums) =>
        prevForums.map((forum) =>
          forum._id === editingForum._id
            ? { ...forum, note: updatedNote, title: updatedTitle, images: response.data.updatedForum.images }
            : forum
        )
      );
      toast.success('Forum post updated successfully!');
      setEditingForum(null);
      setUpdatedNote('');
      setUpdatedTitle('');
      setUpdatedImages(null);
    } catch (error) {
      toast.error('Error updating forum post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    console.log("Token:", token);  // Debugging token
    
    if (!token) {
      toast.error('You must be logged in to delete a post');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/forums/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error deleting forum post');
      }
  
      setForums((prevForums) => prevForums.filter(forum => forum._id !== id));
      toast.success('Forum post deleted successfully!');
    } catch (error) {
      console.error('Error:', error.message);
      toast.error('Error deleting forum post');
    }
  };

  const handleImageChange = (e) => {
    setUpdatedImages(e.target.files);
  };

  if (loading) return <Spinner />; // Display a spinner while loading data
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-container">
      <ToastContainer />
      <h1>Admin Dashboard</h1>
      <p className="admin-subtitle">Manage the forum posts here.</p>

      {/* Debugging Login State */}
      <p>Login state: {isLoggedIn ? "Logged in" : "Not logged in"}</p>

      {/* Conditional rendering of login/registration buttons based on login state */}
      {!isLoggedIn ? (
        <div className="auth-buttons">
          <button className="btn btn-login" onClick={() => { /* Handle Login */ }}>
            Login
          </button>
          <button className="btn btn-register" onClick={() => { /* Handle Registration */ }}>
            Register
          </button>
        </div>
      ) : null}

      {editingForum ? (
        <div className="form-container">
          <h2>Edit Forum Post</h2>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                id="title"
                className="form-input"
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="note">Note:</label>
              <textarea
                id="note"
                className="form-input"
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows="4"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="images">Images:</label>
              <input
                id="images"
                className="form-input"
                type="file"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <div className="button-group">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Post'}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setEditingForum(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="forum-list">
          <h2>Forum Posts</h2>
          {forums.length > 0 ? (
            forums.map((forum) => (
              <div key={forum._id} className="forum-post-card">
                <h3>{forum.title}</h3> {/* Display the title */}
                <p>{forum.note}</p>
                <p>Created by: {forum.user?.username || 'Unknown User'}</p>
                <p>Date: {new Date(forum.createdAt).toLocaleString()}</p>
                <h4>Images:</h4>
                {Array.isArray(forum.images) && forum.images.length > 0 ? (
                  <div className="image-preview">
                    {forum.images.map((image, index) => (
                      <img
                        key={index}
                        src={`${process.env.REACT_APP_API_Image_URL}/${image}`}
                        alt="Forum"
                        className="forum-image"
                      />
                    ))}
                  </div>
                ) : (
                  <p>No images uploaded</p>
                )}

                <div className="button-group">
                  <button className="btn btn-edit" onClick={() => handleEditClick(forum)}>
                    Edit
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(forum._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No forum posts available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;