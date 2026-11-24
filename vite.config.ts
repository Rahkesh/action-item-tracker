import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createApp } from './server/app.ts';

const apiApp = createApp();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            return apiApp(req, res, next);
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
});
