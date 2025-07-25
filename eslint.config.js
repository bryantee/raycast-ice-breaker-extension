const raycastConfig = require("@raycast/eslint-config");

// Flatten the config array since it contains nested arrays
function flattenConfig(config) {
  const result = [];
  for (const item of config) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

module.exports = flattenConfig(raycastConfig);
