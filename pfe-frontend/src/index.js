import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- PATCH DE SECOURS POUR LE BUILD RENDER ---
// On importe l'objet global Material UI et l'icône Close officielle
import * as MuiMaterial from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// On injecte dynamiquement l'export manquant pour satisfaire la dépendance tierce
if (MuiMaterial && !MuiMaterial.Close) {
  MuiMaterial.Close = CloseIcon;
}
// ---------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();