// config-overrides.js
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
    addWebpackAlias({
        // On cible le fichier précis dans node_modules avec un chemin absolu
        '@mui/material/Close': path.resolve(__dirname, 'node_modules/@mui/icons-material/Close')
    })
);