import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function Log() {
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      console.log('Sending login request...');
      console.log('Form data:', Object.fromEntries(formData));
      
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setError(`Server error (${response.status}). Is the API running?`);
        return;
      }

      if (!response.ok) {
        const detail = data.detail;
        setError(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
              : `HTTP ${response.status}`,
        );
        return;
      }
      console.log('Response data:', data);

      if (data.success) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user_id != null) {
          localStorage.setItem('userId', String(data.user_id));
        }
        if (data.user_type) {
          localStorage.setItem('userType', data.user_type);
        }
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        }
        if (data.display_name != null) {
          localStorage.setItem('userDisplayName', String(data.display_name));
        }
        refreshSession();
        const from = location.state?.from;
        const dest =
          data.redirect || (typeof from === 'string' && from !== '/log' ? from : null) || '/patient-dashboard';
        navigate(dest);
      } else {
        // Login failed
        setError(data.error || 'Invalid credentials');
        setDebugInfo(data.debug);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to the server. Please check if the server is running.');
      } else if (err.message.includes('HTTP error')) {
        setError('Server error. Please try again later.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <div className='form'>
      {error && <div className="error-message">{error}</div>}
      
      {debugInfo && (
        <div className="debug-info" style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <h4>Debug Information:</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className='formm'>
        <form onSubmit={handleSubmit}>
          <br />
          <label htmlFor="mail">Email Address</label>
          <input type="email" id="mail" name="mail" placeholder="Email Address" required />
          <br />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Password" required />
          <br />

          <button type="submit" className="logbut">Login</button>
          <br /><br />
          <p>
            Don't have an account? <Link to="/sign">Sign here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Log;
