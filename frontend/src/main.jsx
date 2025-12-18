import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client'; // <-- OK
import './styles/index.css';
import './i18n/index.js';
import App from './App.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
