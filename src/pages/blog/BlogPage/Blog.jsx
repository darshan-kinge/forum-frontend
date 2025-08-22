import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../components/loader/Loader.jsx';
import './Blog.css';
import { useAuth } from '../../../context/AuthContext.jsx';
import BlogCard from '../../../components/cards/blog-cards/BlogCard.jsx';
import HelmetComponent from '../../../components/helmet/HelmetComponent.jsx';
import api from '../../../utils/api.js';

const Blog = () => {
    const { slug } = useParams(); // Get slug from URL
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [allBlogs, setAllBlogs] = useState([]);
    const navigate = useNavigate();
    const { AuthorizationToken, user } = useAuth();
    
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blog/${slug}`);
        const data = response.data;
        setBlog(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
              const response = await api.get('/blog/all');
              const blogs = response.data;                
              setAllBlogs(blogs);
            } catch (error) {
              console.error('Error fetching all blogs:', error);
                
            }
        };
        fetchBlogs();
    }, [slug]);

    const deleteBlog = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
      if (confirmDelete) {
        try {
          await api.delete(`/blog/delete/${id}`);
          setAllBlogs(allBlogs.filter(blog => blog._id !== id));
          navigate('/blogs');
        } catch (error) {
          console.error('Error deleting blog:', error);
        }
      }
    };

    const truncateSummary = (summary) => {
      if (summary.length > 100) {
        return summary.slice(0, 100);
      }
      return summary;
    };

  if (loading) return (
    <>
      <Loader />
    </>
  );
  if (error) return <p>Error: Blog not found</p>;

  return (
    <>
        <HelmetComponent
          pageName={blog.title}
          description={truncateSummary(blog.summary)}
          keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
        />
      
        <div className="blog-wrapper">      
            <div className="blog-view">
            {blog && (
              <>
                <h1 className="blog-title">{blog.title}</h1>
                <div className="blog-content">
                  <div className="blog-content-wrapper">
                    <img src={blog.image} alt={blog.title} className="blog-image" />
                    <p className="blog-dates">
                      Created At: {new Date(blog.createdAt).toLocaleDateString()} | Updated At: {new Date(blog.updatedAt).toLocaleDateString()}
                    </p>
                    {user?.isAdmin && (
                        <div className="admin-btn">
                            <Link to={`/admin/blog/edit/${blog.slug}`} className="edit-link">Edit</Link>
                            <button className="delete-btn" onClick={() => deleteBlog(blog._id)}>Delete</button>
                        </div>
                    )}
                    <div className="blog-content"
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    ></div>
                  </div>
                </div>
              </>
            )}
            </div>

            <div className="recent-blogs">
                <h2 className='recent-blog-title'>Recent Blogs</h2>
                <div className="recent-blog-list">
                    {allBlogs.map((blog) => (
                        <div key={blog._id} className="blog-card recent-blog-card">
                            <BlogCard
                            id={blog._id}
                            title={blog.title}
                            slug={blog.slug}
                            image={blog.image}
                            summary={blog.summary}
                            onDelete={() => deleteBlog(blog._id)}
                            />
                        </div>
                    )).slice(0, 3)}
                </div>
            </div>
        </div>
    </>
  );
};

export default Blog;
