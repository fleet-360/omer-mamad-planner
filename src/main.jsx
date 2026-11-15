import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/global.css';
import './styles/hover.css';
import OmerApp from './app/OmerApp.jsx';
import { startI18n } from './app/i18n.js';

startI18n();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OmerApp />
  </React.StrictMode>
);
