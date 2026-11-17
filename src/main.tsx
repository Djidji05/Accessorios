import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Masquer tous les logs, traces et réponses dans la console du navigateur en production
if ((import.meta as any).env?.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Force le Mode Clair global
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
