import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';

const port = parseInt(process.env.PORT || '3001');

console.log(`🐑 Lestari Farm API starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
  console.log(`📋 API docs: http://localhost:${info.port}/api/health`);
});
