// config-overrides.js
const path = require('path');
const fs = require('fs');

module.exports = function override(config, env) {
    // 1. Créer dynamiquement un fichier de pont temporaire s'il n'existe pas déjà
    const bridgePath = path.resolve(__dirname, 'src/mui-bridge-fixed.js');
    
    if (!fs.existsSync(bridgePath)) {
        const bridgeContent = `
export * from '@mui/material';
export { default as Close } from '@mui/icons-material/Close';
        `;
        fs.writeFileSync(bridgePath, bridgeContent.trim());
    }

    // 2. Forcer Webpack à rediriger l'accès global de @mui/material vers notre pont
    config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/material$': bridgePath
    };

    return config;
};