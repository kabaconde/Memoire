// config-overrides.js
const path = require('path');
const fs = require('fs');

module.exports = function override(config, env) {
    const bridgePath = path.resolve(__dirname, 'src/mui-bridge-fixed.js');
    
    // Création du fichier pont avec les bons chemins absolus
    if (!fs.existsSync(bridgePath)) {
        const bridgeContent = `
import * as mui from '${require.resolve('@mui/material').replace(/\\/g, '/')}';
export * from '${require.resolve('@mui/material').replace(/\\/g, '/')}';
export { default as Close } from '@mui/icons-material/Close';
export default mui.default;
        `;
        fs.writeFileSync(bridgePath, bridgeContent.trim());
    }

    // Appliquer l'alias global sans créer de boucle
    config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/material$': bridgePath
    };

    return config;
};