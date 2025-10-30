import React, { useState, useEffect } from 'react';

function ProtectedData({ onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/protected', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send the token
          }
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Could not fetch data');
        }

        setData(result);
        setError('');
      } catch (err) {
        setError(err.message);
        setData(null);
      }
    };

    fetchData();
  }, []); // Run once on component mount

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '40px auto' }}>
      <h2>Protected Dashboard</h2>
      <button onClick={onLogout} style={{ float: 'right', background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
        Logout
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {data && (
        <div style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', marginTop: '40px' }}>
          <h3>{data.message}</h3>
          <p>Welcome, <strong>{data.user.username}</strong> (User ID: {data.user.id})!</p>
          <p>Your token was successfully verified by the server.</p>
        </div>
      )}
    </div>
  );
}

export default ProtectedData;