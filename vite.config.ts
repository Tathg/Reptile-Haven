import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Path aliases — must mirror tsconfig.json `paths` exactly
  resolve: {
    alias: {
      '@types':   resolve(__dirname, 'src/types'),
      '@core':    resolve(__dirname, 'src/core'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@scenes':  resolve(__dirname, 'src/scenes'),
      '@ui':      resolve(__dirname, 'src/ui'),
      '@utils':   resolve(__dirname, 'src/utils'),
      '@data':    resolve(__dirname, 'src/data'),
      '@config':  resolve(__dirname, 'src/config'),
    },
  },

  // Include image and audio asset formats used by Phaser
  assetsInclude: ['**/*.png', '**/*.mp3', '**/*.ogg', '**/*.wav'],

  build: {
    outDir: 'dist',
    target: 'es2020',
    // Phaser bundles large; raise the warning threshold to avoid noise
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        // Keep Phaser in its own chunk for better caching
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: false,
  },
});
