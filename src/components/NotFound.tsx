import { Helmet } from 'react-helmet'

import Footer from './Footer'

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Not Found - Kwitter</title>
      </Helmet>

      <div className='min-h-screen px-10 pt-40 text-center font-mono text-xl font-bold'>
        404 - This page could not be found.
      </div>
      <Footer />
    </>
  )
}

export default NotFound
