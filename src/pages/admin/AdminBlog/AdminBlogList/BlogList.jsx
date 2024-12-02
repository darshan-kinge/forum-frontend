import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogList.css'
import {useAuth} from '../../../../context/AuthContext.jsx';

const AdminBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { AuthorizationToken } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/blog/all?page=${page}`);
        const data = await response.json();
        console.log(data);
        
        setBlogs(data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, [page]);

  const deleteBlog = async (id) => {
    try {
      if (!id) {
        console.error('Blog ID is undefined');
        return;
      }
      const response = await fetch(`http://localhost:3000/api/v1/blog/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: AuthorizationToken
        }
      });
      if (response.ok) {
        setBlogs(blogs.filter((blog) => blog._id !== id));
      } else {
        console.error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  return (
    <div className="admin-page">
      <div className="create-blog-btn">
        <Link to="/admin/blog/new" className="create-link">Create Blog</Link>
      </div>
      <ul className="blog-list">
        {(blogs.length === 0) ? <h2>No blogs found</h2> : blogs.map((blog) => (
          <li key={blog._id} className="blog-item">
            <h3>{blog.title}</h3>
            <div className="item-btn">
              <Link to={`/blogs/${blog.slug}`} className="view-link">View</Link>
              <Link to={`/admin/blog/edit/${blog.slug}`} className="edit-link">Edit</Link>
              <button className="delete-btn" onClick={() => deleteBlog(blog._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`page-btn ${page === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>


  );
};

export default AdminBlogList;