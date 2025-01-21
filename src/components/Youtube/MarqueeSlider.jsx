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
            <div className="video-marquee-title">
                <h2 className="marquee-title">Sanvad - The Podcast Series</h2>
            </div>
            <div className="video-marquee-container">
                <div className="video-marquee-track">
                    {videos.map(video => (
                    <div key={video.id} className="video-marquee-item">
                    <a href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`} target="_blank" rel="noopener noreferrer">
                        <img 
                        src={video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url} 
                        alt={video.snippet.title} 
                        />
                        {/* <p className="video-title">{video.snippet.title}</p> */}
                    </a>
                    </div>
                ))}
            </div>

      </div>
        </>
    );
  };

  export default MarqueeSlider;