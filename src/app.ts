import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import blogRoutes from './routes/blog.js';
import testimonialRoutes from './routes/testimonials.js';
import contactRoutes from './routes/contact.js';
import galleryRoutes from './routes/gallery.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import transactionRoutes from './routes/transactions.js';

const app = new Hono().basePath('/api');

// ============================================================
// Global Middleware
// ============================================================

app.use('*', logger());

app.use('*', cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ============================================================
// Routes
// ============================================================

app.route('/auth', authRoutes);
app.route('/products', productRoutes);
app.route('/blog', blogRoutes);
app.route('/testimonials', testimonialRoutes);
app.route('/contact', contactRoutes);
app.route('/gallery', galleryRoutes);
app.route('/settings', settingsRoutes);
app.route('/upload', uploadRoutes);
app.route('/transactions', transactionRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', name: 'Lestari Farm API', timestamp: new Date().toISOString() }));

// 404 fallback
app.notFound((c) => c.json({ success: false, error: 'Endpoint tidak ditemukan' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
