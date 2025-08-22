import React from 'react'
import { Helmet } from 'react-helmet-async'

const HelmetComponent = ({ pageName, description, keywords }) => {

    const title = `${pageName} | MIT-WPU Science & Spirituality Forum`;

  return (
    <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
    </Helmet>
  )
}

export default HelmetComponent;