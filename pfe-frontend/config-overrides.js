// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
    // Ajouter un alias pour résoudre le problème CloseIcon
    config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/material/Close': '@mui/icons-material/Close',
        '@mui/material/CloseIcon': '@mui/icons-material/Close'
    };
    
    // Plugin pour injecter l'export manquant
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            CloseIcon: ['@mui/icons-material', 'Close']
        })
    ]);
    
    return config;
};