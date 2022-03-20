import Footer from './Footer';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const NotFound = () => {
  return (<>
    <HelmetProvider>
      <Helmet>
        <title>Not Found - Kwitter</title>
      </Helmet>
    </HelmetProvider>
    <div className="min-h-screen font-mono font-bold text-xl text-center pt-40 px-10">
      404 - This page could not be found.
    </div>
    <Footer/>
  </>);
}

export default NotFound;
