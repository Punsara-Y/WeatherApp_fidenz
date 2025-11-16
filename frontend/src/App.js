import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import WeatherList from './WeatherList';
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
    <div className="container">
      <header className="header">
        <h1>Fidenz Weather</h1>
        <div>
          {isAuthenticated && (
            <>
              <span className="user">Hello, {user?.name || user?.email}</span>
              <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
            </>
          )}
        </div>
      </header>

      <main>
        {isAuthenticated && <WeatherList />}
      </main>

      <footer className="footer">
        <small>2021 Fidenz Technologies</small>
      </footer>
    </div>
  );
}

export default App;
