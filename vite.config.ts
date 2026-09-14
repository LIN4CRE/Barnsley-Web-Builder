import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    // `/` for local + self-hosted; `/Barnsley-Web-Builder/` for GitHub Pages (set via VITE_BASE in CI).
    base: process.env.VITE_BASE ?? '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: isProduction ? 'hidden' : true,
      // The only chunk above 300 kB is the lazy `ChartPanel` chunk (~400 kB),
      // which is fetched on demand and never blocks first paint. Raise the
      // threshold past it so the warning stays meaningful: it now fires only if
      // a chunk grows beyond the chart bundle, which would be a real regression.
      chunkSizeWarningLimit: 450,
      rollupOptions: {
        output: {
          /**
           * Only React and the icon set are split manually.
           *
           * Recharts is deliberately NOT listed: it is imported solely by
           * `ChartPanel`, which is a dynamic import, so Rollup already places it
           * in the async chart chunk. Listing it here created a
           * `charts -> vendor -> charts` cycle that forced the charting bundle
           * back into the initial payload and defeated the lazy loading.
           */
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
            return undefined;
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // Required so the app works behind Cloud Run, Codespaces, and sandbox preview
      // proxies instead of returning "Blocked request. This host is not allowed".
      allowedHosts: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      css: false,
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  };
});
