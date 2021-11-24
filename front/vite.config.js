import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  server: {
    port: '8080',
    https: false,
    open: true,
  },
  assetsInclude: ['**/*.gltf'],
  plugins: [glsl()],
});
