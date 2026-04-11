import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function Sign() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    address: '',
    phone: '',
    // Patient fields
    nomp: '',
    prenomp: '',
    nss: '',
    poids: '',
    taille: '',
    utilisation_prpl: 'MANUELLE',
    aidant: false,
    // Clinician fields
    nomc: '',
    prenomc: '',
    specialite: '',
    // Vendor fields
    nom_commercial: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  // Log to check if this component is mounted
  console.log('Sign Component Rendered');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Basic validation
    if (!formData.email || !formData.password || !formData.profession || 
        !formData.address || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }

    // Profession-specific validation
    switch (formData.profession) {
      case '1': // Patient
        if (!formData.nomp || !formData.prenomp || !formData.nss || 
            !formData.poids || !formData.taille || !formData.utilisation_prpl) {
          setError("Please fill in all patient information.");
          return;
        }
        break;
      case '2': // Clinician
        if (!formData.nomc || !formData.prenomc || !formData.specialite) {
          setError("Please fill in all clinician information.");
          return;
        }
        break;
      case '4': // Vendor
        if (!formData.nom_commercial) {
          setError("Please fill in the commercial name.");
          return;
        }
        break;
    }

    try {
      console.log('Form data:', formData);
      const { confirmPassword: _c, ...registerPayload } = formData;
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(registerPayload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError(response.ok ? 'Invalid response from server' : `Server error (${response.status})`);
        return;
      }

      if (!response.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg || d).join(', ')
              : data.error || `Request failed (${response.status})`;
        setError(msg);
        return;
      }

      if (data.success) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user_id != null) localStorage.setItem('userId', String(data.user_id));
        if (data.user_type) localStorage.setItem('userType', data.user_type);
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.display_name != null) localStorage.setItem('userDisplayName', String(data.display_name));
        refreshSession();
        const dest =
          data.redirect ||
          (formData.profession === '1'
            ? '/patient-dashboard'
            : formData.profession === '2'
              ? '/clinician-dashboard'
              : formData.profession === '4'
                ? '/vendor-dashboard'
                : null);
        if (dest) {
          navigate(dest);
        } else {
          setError('Invalid profession selected');
        }
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(`An error occurred: ${err.message}`);
    }
  };

  const renderProfessionFields = () => {
    switch (formData.profession) {
      case '1': // Patient
        return (
          <>
            <div className="form-group">
              <label htmlFor="nomp">Last Name</label>
              <input
                type="text"
                id="nomp"
                name="nomp"
                value={formData.nomp}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenomp">First Name</label>
              <input
                type="text"
                id="prenomp"
                name="prenomp"
                value={formData.prenomp}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nss">Social Security Number</label>
              <input
                type="text"
                id="nss"
                name="nss"
                value={formData.nss}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="poids">Weight (kg)</label>
              <input
                type="number"
                id="poids"
                name="poids"
                value={formData.poids}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="taille">Height (cm)</label>
              <input
                type="number"
                id="taille"
                name="taille"
                value={formData.taille}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="utilisation_prpl">Propulsion Type</label>
              <select
                id="utilisation_prpl"
                name="utilisation_prpl"
                value={formData.utilisation_prpl}
                onChange={handleChange}
                required
              >
                <option value="MANUELLE">Manual</option>
                <option value="ELECTRIQUE">Electric</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="aidant"
                  checked={formData.aidant}
                  onChange={handleChange}
                />
                Has Caregiver
              </label>
            </div>
          </>
        );
      case '2': // Clinician
        return (
          <>
            <div className="form-group">
              <label htmlFor="nomc">Last Name</label>
              <input
                type="text"
                id="nomc"
                name="nomc"
                value={formData.nomc}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenomc">First Name</label>
              <input
                type="text"
                id="prenomc"
                name="prenomc"
                value={formData.prenomc}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="specialite">Specialty</label>
              <input
                type="text"
                id="specialite"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
      case '4': // Vendor
        return (
          <div className="form-group">
            <label htmlFor="nom_commercial">Commercial Name</label>
            <input
              type="text"
              id="nom_commercial"
              name="nom_commercial"
              value={formData.nom_commercial}
              onChange={handleChange}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form">
     
      <div className="formm">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="profession">Profession</label>
            <select
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              required
            >
              <option value="">Select Profession</option>
              <option value="1">Patient</option>
              <option value="2">Clinician</option>
              <option value="4">Vendor</option>
            </select>
          </div>

          {renderProfessionFields()}
          
          <button type="submit" className="logbut">
            Sign Up
          </button>
          <br />
          
          <p>
            Already have an account? <a href="/log">Log in here</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Sign;
