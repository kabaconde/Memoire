// mui-patch.js
// On ré-exporte tout MUI Material normalement
export * from '@mui/material';

// On y greffe explicitement l'export manquant pour la dépendance capricieuse
export { default as Close } from '@mui/icons-material/Close';
export { default as CloseIcon } from '@mui/icons-material/Close';