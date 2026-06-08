// config-overrides.js
const path = require('path');

module.exports = function override(config, env) {
    // On redirige l'import exact de @mui/material vers notre patch complet
    config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/material$': path.resolve(__dirname, 'mui-patch.js')
    };

    return config;
};