import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force le Mode Clair global
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
