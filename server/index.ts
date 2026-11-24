import path from 'node:path';
import express from 'express';
import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// If dist folder exists, serve client static files
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// For SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Action Item Tracker running on http://localhost:${PORT}`);
});
