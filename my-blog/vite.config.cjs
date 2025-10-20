// my-blog/vite.config.cjs
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  // add any other vite config you had here
});