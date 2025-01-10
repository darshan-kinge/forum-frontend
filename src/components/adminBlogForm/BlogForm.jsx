import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext.jsx';
import './BlogForm.css';

import { useNavigate, useParams } from 'react-router-dom';
import config from '../../config/config.js';

const BlogForm = ({ editMode = false, postData = {} }) => {
  const [editPostData, setEditPostData] = useState({});
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [blogId, setBlogId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const { AuthorizationToken, user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams()

  const fetchPost = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/api/v1/blog/${slug}`);
      const data = await response.json();
      setTitle(data.title);
      setSummary(data.summary);
      setContent(data.content);
      setBlogId(data._id);
      // console.log(data)
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }

  useEffect(() => {
    if (editMode) {
      fetchPost();

    }
  }, [editMode]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    console.log('Form Data:', formData);
    

    try {
      setLoading(true);
      const response = await fetch(
        editMode ? `${config.serverUrl}/api/${config.apiVersion}/blog/edit/${blogId}` : `${config.serverUrl}/api/${config.apiVersion}/blog/create`, {
        method: editMode ? 'PUT' : 'POST',
        body: formData,
        headers: {
          Authorization: AuthorizationToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Blog saved successfully');
        navigate('/blogs');
        console.log('Blog saved successfully', data);
        setLoading(false);  
      }
    } catch (error) {
        alert('Error creating or updating blog post');
        navigate('/admin/blog');
        console.error('Error creating or updating blog post', error);
      setLoading(false);
    }
  };

  return (
    <div className="blog-admin-form">
        <h1 className='blog-form-title'>{editMode ? 'Edit Post' : 'Create Post'}</h1>
        <form className="blog-form">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="input-title"

            />

            <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary"
            className="input-title"
            />

            <ReactQuill 
                className="editor" 
                theme="snow" 
                value={content} 
                onChange={setContent} 
            />

            <input 
                type="file" 
                onChange={(e) => setImage(e.target.files[0])} 
                className="input-file" 

            />

            <button 
                type="submit" 
                className="submit-btn"
                onClick={handleSubmit}
            >
              {editMode ? 'Update Post' : 'Create Post'}
            </button>
        </form>
    </div>
  );
};

export default BlogForm;
