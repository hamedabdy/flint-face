// core-ui-react/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  // replaces FAST_REFRESH=true — HMR is always on

  server: {
    port: 3000,
    host: '0.0.0.0',   // makes dev server reachable from Docker host
    watch: {
      usePolling: true, // replaces CHOKIDAR_USEPOLLING + WATCHPACK_POLLING
      interval: 1000,
    },
    https: false,       // replaces HTTPS=false
  },

  build: {
    outDir: 'build',    // keeps your Dockerfile paths unchanged
    sourcemap: false,   // replaces GENERATE_SOURCEMAP=false
  },
});