import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { siteSettings, products, blogPosts, contactMessages, testimonials } from '../db/schema.js';
import { success, error } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';

const settingsRoutes = new Hono();

// GET /api/settings — Public (site settings)
settingsRoutes.get('/', async (c) => {
  const data = await db.select().from(siteSettings);

  // Convert to key-value object
  const settings: Record<string, string> = {};
  for (const item of data) {
    settings[item.key] = item.value;
  }

  return success(c, settings);
});

// PUT /api/settings/admin — Update settings
settingsRoutes.put('/admin', authMiddleware, async (c) => {
  const body = await c.req.json();
  const { settings } = body;

  if (!settings || !Array.isArray(settings)) {
    return error(c, 'Format data tidak valid');
  }

  for (const { key, value } of settings) {
    await db.insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }

  return success(c, { message: 'Pengaturan berhasil disimpan' });
});

// GET /api/dashboard/stats — Admin dashboard stats
settingsRoutes.get('/dashboard/stats', authMiddleware, async (c) => {
  const [
    productCount,
    blogCount,
    messageCount,
    unreadCount,
    testimonialCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(blogPosts),
    db.select({ count: sql<number>`count(*)` }).from(contactMessages),
    db.select({ count: sql<number>`count(*)` }).from(contactMessages).where(eq(contactMessages.isRead, false)),
    db.select({ count: sql<number>`count(*)` }).from(testimonials),
  ]);

  return success(c, {
    totalProducts: Number(productCount[0].count),
    totalBlogPosts: Number(blogCount[0].count),
    totalMessages: Number(messageCount[0].count),
    unreadMessages: Number(unreadCount[0].count),
    totalTestimonials: Number(testimonialCount[0].count),
  });
});

export default settingsRoutes;
