import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../../components/loader/Loader.jsx';
import './Blog.css';
import { useAuth } from '../../../context/AuthContext.jsx';
import BlogCard from '../../../components/cards/blog-cards/BlogCard.jsx';

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
        const response = await fetch(`http://localhost:3000/api/v1/blog/${slug}`);
        if (!response.ok) {
          throw new Error('Blog not found');
        }
        const data = await response.json();
        console.log(data);
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
                const response = await fetch(`http://localhost:3000/api/v1/blog/all`);
                const blogs = await response.json();
                console.log(blogs);
                
                setAllBlogs(blogs);
            } catch (error) {
                console.error('Error fetching all blogs:', error);
                
            }
        };
        fetchBlogs();
    }, [slug]);

    const deleteBlog = async (id) => {
      await fetch(`http://localhost:3000/api/v1/blog/delete/${id}`, {
        method: 'DELETE', 
        headers: {
          Authorization: AuthorizationToken
        }
      });
      navigate('/blog');
    };

  if (loading) return (
    <>
      <Loader />
    </>
  );
  if (error) return <p>Error: Blog not found</p>;

  return (
    <>
        <div className="blog-wrapper">      
            <div className="blog-view">
            {blog && (
              <>
                <h1 className="blog-title">{blog.title}</h1>

                <div className="blog-content-wrapper">
                    <img src={blog.image} alt={blog.title} className="blog-image" />

                    {user?.isAdmin && (
                        <div className="admin-btn">
                            <Link to={`/admin/blog/edit/${blog._id}`} className="edit-link">Edit</Link>
                            <button className="delete-btn" onClick={() => deleteBlog(blog._id)}>Delete</button>
                        </div>
                    )}
                    <div className="blog-content"
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    ></div>
                </div>
              </>
            )}
            </div>

            <div className="recent-blogs">
                <h2 className='recent-blog-title'>Recent Blogs</h2>
                <div className="recent-blog-list">
                    {allBlogs.map((blog) => (
                        <div key={blog._id} className="recent-blog-card">
                            <BlogCard
                            id={blog._id}
                            title={blog.title}
                            slug={blog.slug}
                            image={blog.image}
                            summary={blog.summary}
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
