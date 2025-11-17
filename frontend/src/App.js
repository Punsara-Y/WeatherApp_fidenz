import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeatherList from './WeatherList';
import WeatherDetail from './WeatherDetail'; // new detailed page
import './styles.css';

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  // Automatically redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) return <div className="center">Loading...</div>;

  return (
    <Router>
      <div>
        <header className="header">
          <div className='user-wrapper'>
            {isAuthenticated && (
              <>
                <span className="user">Hello, {user?.name || user?.email}</span>
                <button 
                  className='logoutbtn' 
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        <main>
          {isAuthenticated && (
            <Routes>
              <Route path="/" element={<WeatherList />} />
              <Route path="/weather/:cityName" element={<WeatherDetail />} />
            </Routes>
          )}
        </main>

        <footer className="footer">
          <small>2025 Fidenz Technologies</small>
        </footer>
      </div>
    </Router>
  );
}

export default App;
