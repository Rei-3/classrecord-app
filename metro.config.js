// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');
 
// const config = getDefaultConfig(__dirname)
 
// module.exports = withNativeWind(config, { input: './global.css' })



const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Example: customize resolver
config.resolver.sourceExts.push("cjs");

// You can add other customizations here
module.exports = withNativeWind(config, { input: './global.css' })
module.exports = config;
