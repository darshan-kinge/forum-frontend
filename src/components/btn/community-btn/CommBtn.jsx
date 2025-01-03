import React from 'react'
import { Link } from 'react-router-dom'
import './CommBtn.css'

const CommBtn = ({to, title, click}) => {
  return (
    <div className="community-btn">
        <Link onClick={click} to={to} className="join-btn">
        <div className="btn">{title}
            <div className="btn-arr">
              <svg color='white' className='arr' xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z"/></svg>
            </div>
        </div>
        </Link>
    </div>
  )
}

export default CommBtn