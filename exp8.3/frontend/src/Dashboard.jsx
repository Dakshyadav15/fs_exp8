import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import the new library
import './Dashboard.css';
function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [apiResponse, setApiResponse] = useState({
    profile: 'Click to test',
    moderator: 'Click to test',
    admin: 'Click to test',
  });

  // On component load, get token and decode it
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        setUser(decodedToken);
      } catch (error) {
        console.error('Failed to decode token:', error);
        onLogout(); // Log out if token is bad
      }
    }
  }, [onLogout]);

  // Helper function to test API routes
  const testApiRoute = async (route) => {
    try {
      const response = await fetch(`http://localhost:4000/api/${route}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      return { status: 'success', message: data.message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  // Button click handlers
  const handleTestRoute = async (route) => {
    const result = await testApiRoute(route);
    setApiResponse(prev => ({ ...prev, [route]: result }));
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  // Helper to style the API response
  const getStatusStyle = (result) => {
    if (result.status === 'success') return { color: 'green', fontWeight: 'bold' };
    if (result.status === 'error') return { color: 'red', fontWeight: 'bold' };
    return { color: 'grey' };
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '700px', margin: '40px auto' }}>
      <button onClick={onLogout} style={{ float: 'right' }}>Logout</button>
      <h2>Dashboard</h2>
      <p>Welcome, <strong>{user.username}</strong>!</p>
      <p>Your Role: <strong>{user.role}</strong></p>

      <hr />
      <h3>Test API Routes</h3>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => handleTestRoute('profile')}>Test /api/profile</button>
        <span style={getStatusStyle(apiResponse.profile)}>
          {apiResponse.profile.message || apiResponse.profile}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => handleTestRoute('moderator')}>Test /api/moderator</button>
        <span style={getStatusStyle(apiResponse.moderator)}>
          {apiResponse.moderator.message || apiResponse.moderator}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => handleTestRoute('admin')}>Test /api/admin</button>
        <span style={getStatusStyle(apiResponse.admin)}>
          {apiResponse.admin.message || apiResponse.admin}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;