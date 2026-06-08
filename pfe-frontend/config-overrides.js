// config-overrides.js
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
    addWebpackAlias({
        '@mui/material/Close': '@mui/icons-material/Close'
    })
);