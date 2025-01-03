import React from 'react'
import { Link } from 'react-router-dom';
import HelmetComponent from '../../components/helmet/HelmetComponent';

const _404 = () => {
  return (
    <div style={{ textAlign: 'center', height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>

      <HelmetComponent
        pageName="404"
        description="Page not found"
        keywords="404, Page not found, 404 error"
      />

        <h1 style={{ color: 'white', textAlign: 'center', fontSize: '3em' }}>404 Not Found</h1>
        <p style={{  color: 'white', textAlign: 'center', fontSize: '2em' }}>Sorry, the page you are looking for does not exist.</p>
        <p style={{ textAlign: 'center', textDecoration: 'none', color: 'white' }} className=''>
            <Link to='/' style={{ textAlign: 'center', textDecoration: 'underline', color: 'white' }}>Go back to Home</Link>
        </p>
    </div>
  )
}

export default _404;