import React, { useEffect, useState } from 'react';
import './MarqueeSlider.css'
import config from '../../config/config';


const MarqueeSlider = ({ playlistId }) => {
    const [videos, setVideos] = useState([]);
  
    useEffect(() => {
      const fetchPlaylistVideos = async () => {
        try {
          const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${config.youtubeApiKey}`);
          const data = await response.json();
          setVideos(data.items);
        } catch (error) {
          console.error('Error fetching playlist videos:', error);
        }
      };
  
      fetchPlaylistVideos();
    }, [playlistId]);
  
    return (
        <>
            <div className="podcast-section-title">
                <h2 className="podcast-title">Sanvad - The Podcast Series</h2>
            </div>
            <div className="podcast-grid-container">
                {videos.map((video, idx) => (
                    <div key={video.id} className="podcast-card-new">
                        <a
                            href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="podcast-link-new"
                        >
                            <div className="podcast-thumb-area">
                                <img
                                    src={video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url}
                                    alt={video.snippet.title}
                                    className="podcast-thumbnail-new"
                                />
                                <span className="podcast-badge">EP {idx + 1}</span>
                                <span className="podcast-play-btn">
                                    <svg width="32" height="32" viewBox="0 0 32 32">
                                        <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.55)" />
                                        <polygon points="13,10 24,16 13,22" fill="#fff" />
                                    </svg>
                                </span>
                            </div>
                            <div className="podcast-info-new">
                                <div className="podcast-title-new">{video.snippet.title}</div>
                                <div className="podcast-desc-new">
                                    {video.snippet.description ? video.snippet.description.slice(0, 80) + (video.snippet.description.length > 80 ? '...' : '') : ''}
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </>
    );
  };

  export default MarqueeSlider;