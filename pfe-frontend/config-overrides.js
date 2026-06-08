// config-overrides.js
const path = require('path');

module.exports = function override(config, env) {
    // On cible désormais le fichier dans le dossier autorisé src/
    config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/material$': path.resolve(__dirname, 'src/mui-patch.js')
    };

    return config;
};