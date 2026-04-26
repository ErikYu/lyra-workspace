const { composePlugins, withNx, withWeb } = require('@nx/webpack');

// Nx 22 @nx/webpack:webpack requires a composable config; without it the build
// falls back to an empty webpack config and resolves entry as ./src from the repo root.
module.exports = composePlugins(withNx(), withWeb());
