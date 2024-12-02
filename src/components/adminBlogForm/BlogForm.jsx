import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import './BlogForm.css';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../../config/config.js';

const BlogForm = ({ editMode = false}) => {
  const [postData, setPostData] = useState(null);
  const [title, setTitle] = useState('');
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const  { slug } = useParams();
  const { AuthorizationToken, user } = useAuth();
  const navigate = useNavigate();

  const fetchPost = async () => {
    if (slug) {
      const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/blog/${slug}`);  
      const data = await response.json();

      if (editMode && data) {
        setTitle(data.title);
        setSummary(data.summary);
        setContent(data.content);
        setImage(data.image);
        setId(data._id);
      } 
    }
  }
  useEffect(() => {
    try {
      fetchPost();
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    formData.append('author', user._id);
    if (image) {
      formData.append('image', image);
    }

    try {
      const config = {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          Authorization: AuthorizationToken
        },
        body: formData,
      };

      const url = editMode
        ? `${config.serverUrl}/api/${config.apiVersion}/blog/edit/${id}`
        : `${config.serverUrl}/api/${config.apiVersion}/blog/create`;

      const response = await fetch(url, config);
      const data = await response.json();

      if (response.ok) {
        alert('Blog saved successfully');
        navigate('/blog');
        console.log('Blog saved successfully', data);
      } else {
        alert('Error creating or updating blog post');
        console.error('Error creating or updating blog post', data);
      }
      setLoading(false);
    } catch (error) {
      alert('Error creating or updating blog post');
      console.error('Error creating or updating blog post', error);
      setLoading(false);
    }
  };

  return (
    <div className="blog-admin-form">
      <h1 className="blog-form-title">{editMode ? 'Edit Post' : 'Create Post'}</h1>
      <form className="blog-form" onSubmit={handleSubmit}>
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
        <ReactQuill className='editor' value={content} onChange={setContent} />
        <input className="input-file" type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : editMode ? 'Update Blog' : 'Create Blog'}
        </button>
      </form>
    </div>
  );
};

export default BlogForm;

// import React, { useEffect, useState } from 'react';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { useAuth } from '../../context/AuthContext.jsx';
// import './BlogForm.css';
// import { Navigate, useParams } from 'react-router-dom';

// const BlogForm = ({ editMode = false, postData = {} }) => {
//   const [editPostData, setEditPostData] = useState({});
//   const {id} = useParams()

//   const fetchPost = async () => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/v1/blog/get/${id}`);
//       const data = await response.json();
//       setEditPostData(data);
//     } catch (error) {
//       console.error('Error fetching post:', error);
//     }
//   }

//   useEffect(() => {
//     if (editMode) {
//       fetchPost();
//     }
//   }, [editMode]);

//   const [title, setTitle] = useState(editMode ? editPostData.title : '');
//   const [summary, setSummary] = useState(editMode ? editPostData.summary : '');
//   const [content, setContent] = useState(editMode ? editPostData.content : '');
//   const [loading, setLoading] = useState(false);
//   const [image, setImage] = useState(null);
//   const { AuthorizationToken, user } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('summary', summary);
//     formData.append('content', content);
//     formData.append('author', user._id);
//     if (image) {
//       formData.append('image', image);
//     }

//     console.log('Form Data:', formData);
    

//     try {
//       setLoading(true);
//       const response = await fetch(
//         editMode ? `http://localhost:3000/api/v1/blog/edit/${id}` : 'http://localhost:3000/api/v1/blog/create', {
//         method: editMode ? 'PUT' : 'POST',
//         body: formData,
//         headers: {
//           Authorization: AuthorizationToken,
//         },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         alert('Blog saved successfully');
//         <Navigate to={'/blog'} />
//         console.log('Blog saved successfully', data);
//         setLoading(false);  
//       }
//     } catch (error) {
//         alert('Error creating or updating blog post');
//         console.error('Error creating or updating blog post', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="blog-admin-form">
//         <h1 className='blog-form-title'>{editMode ? 'Edit Post' : 'Create Post'}</h1>
//         <form className="blog-form">
//             <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Title"
//                 className="input-title"

//             />

//             <input
//             type="text"
//             value={summary}
//             onChange={(e) => setSummary(e.target.value)}
//             placeholder="Summary"
//             className="input-title"
//             />

//             <ReactQuill 
//                 className="editor" 
//                 theme="snow" 
//                 value={content} 
//                 onChange={setContent} 
//             />

//             <input 
//                 type="file" 
//                 onChange={(e) => setImage(e.target.files[0])} 
//                 className="input-file" 

//             />

//             <button 
//                 type="submit" 
//                 className="submit-btn"
//                 onClick={handleSubmit}
//             >
//               {editMode ? 'Update Post' : 'Create Post'}
//             </button>
//         </form>
//     </div>
//   );
// };

// export default BlogForm;
