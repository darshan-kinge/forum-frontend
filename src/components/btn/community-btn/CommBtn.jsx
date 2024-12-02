import React from 'react'
import { Link } from 'react-router-dom'
import './CommBtn.css'

const CommBtn = ({to}) => {
  return (
    <div className="community-btn">
        <Link to={to} className="join-btn">
        <div className="btn">Join Community
            <div className="btn-arr">
                <svg color='white' className='arr' xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z"/></svg>
            </div>
        </div>
        </Link>
    </div>
  )
}

export default CommBtn