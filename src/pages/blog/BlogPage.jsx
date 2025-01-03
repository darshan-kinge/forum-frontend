import React, { useEffect, useState } from 'react';
import './BlogPage.css';
import BlogCard from '../../components/cards/blog-cards/BlogCard.jsx';
import config from '../../config/config.js';
import Loader from '../../components/loader/Loader.jsx';
import HelmetComponent from '../../components/helmet/HelmetComponent.jsx';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {

      try {
        setLoading(true);
        const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/blog/all`);
        const data = await response.json();
        setBlogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      }

    };
    fetchBlogs();
  }, [page]);


  if (loading) return <Loader />;

  return (
    <div className="blog-page">

      <HelmetComponent
        pageName="Blogs"
        description="Blogs by MIT-WPU Science and Spirituality Forum"
        keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
      />

      <h1 className="page-title">Blog</h1>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <div className="blog-card" key={blog._id}>
            <BlogCard
              id={blog._id}
              title={blog.title}
              slug={blog.slug}
              image={blog.image}
              summary={blog.summary}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
