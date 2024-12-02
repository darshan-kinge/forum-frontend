import React from 'react'
import { Link } from 'react-router-dom' 
import './BlogCard.css'

const BlogCard = ({ title, slug, image, summary }) => {

    const truncateSummary = (summary, maxLength = 60) => {
        return summary.length > maxLength ? `${summary.substring(0, maxLength)}...` : summary;
    };

    const truncateTitle = (title, maxLength = 40) => {
        return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
    }

  return (
    <>
        <div className="blog-card">
            <Link className='link' to={`/blogs/${slug}`}>
                <div className="card-image-wrapper">
                    <img src={image} alt={title} className="card-image" />
                </div>
                <h2 style={{ textDecoration: 'none' }} className="blog-card-title">
                    {truncateTitle(title)}
                </h2>
                <p className="blog-card-summary">
                    {truncateSummary(summary)}
                    {summary.length > 20 && <span className="read-more">Read more</span>} 
                </p>

            </Link>
        </div>
    </>
  )
}

export default BlogCard