import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';
import data from './data.js';
import BlogCard from '../../components/cards/blog-cards/BlogCard.jsx';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await fetch(`http://localhost:3000/api/v1/blog/all`);
      // console.log(response);
      const data = await response.json();
      setBlogs(data);
      console.log(data);
    };
    fetchBlogs();
  }, [page]);


  return (
    <div className="blog-page">
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

            {/* <Link className='link' to={`/blog/${blog.slug}`}>
              <div className="card-image-wrapper">
                <img src={blog.image} alt={blog.title} className="card-image" />
              </div>
              <h2 style={{ textDecoration: 'none' }} className="blog-card-title">
                {blog.title}
              </h2>
              <p className="blog-card-summary">
                {truncateSummary(blog.summary)}
                {blog.summary.length > 20 && <span className="read-more">Read more</span>}
              </p>
            </Link> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
