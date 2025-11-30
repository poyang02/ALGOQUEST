import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // 1. Import BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // 2. Wrap your App component in <BrowserRouter>
  <BrowserRouter>
    <App />
  </BrowserRouter>
);