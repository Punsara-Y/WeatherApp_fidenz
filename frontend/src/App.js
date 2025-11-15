import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import WeatherList from './WeatherList';
import './styles.css';

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <div className="center">Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>Fidenz Weather</h1>
        <div>
          {isAuthenticated ? (
            <>
              <span className="user">Hello, {user?.name || user?.email}</span>
              <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
            </>
          ) : (
            <button onClick={() => loginWithRedirect()}>Login</button>
          )}
        </div>
      </header>

      <main>
        {isAuthenticated ? (
          <WeatherList />
        ) : (
          <div className="center">
            <p>Please log in to view the weather data.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <small>Built for Fidenz assignment</small>
      </footer>
    </div>
  );
}

export default App;
