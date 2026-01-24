import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Routes from "./Routes";
import SocialNavBar from "./components/ui/SocialNavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const [showSocialNav, setShowSocialNav] = useState(false);

  useEffect(() => {
    // Show SocialNavBar on social platform pages
    const socialPaths = ['/feed', '/explore', '/create-post', '/notifications', '/social-messages', '/profile'];
    setShowSocialNav(socialPaths.some(path => location.pathname.startsWith(path)));
  }, [location.pathname]);

  return (
    <>
      {showSocialNav && <SocialNavBar />}
      <div className={showSocialNav ? 'md:ml-64' : ''}>
        <Routes />
      </div>
      {/* Toast container (must be inside App once) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
