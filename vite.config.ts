import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  publicDir: 'public',
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.vite.json'],
    }),
  ],
  server: {
    port: 3001,
    watch: {
      cwd: path.resolve(__dirname, 'src/lib/'),
    },
  },
  build: {
    manifest: true,
    outDir: 'build/main/lib',
    lib: {
      entry: path.resolve(__dirname, 'src/lib/main.ts'),
      name: 'MyLib',
      formats: ['iife'],
      fileName: (format) => `main.${format}.js`,
    },
    rollupOptions: {
      // overwrite default .html entry
      input: path.resolve(__dirname, 'src/lib/main.ts'),
    },
  },
});
