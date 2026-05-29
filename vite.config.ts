import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path matches the GitHub Pages repo name so asset + data URLs resolve.
export default defineConfig({
  base: '/dbt-Wizard-Deep-Dive/',
  plugins: [react()],
});
