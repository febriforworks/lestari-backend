import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { galleryItems } from '../db/schema.js';
import { createGallerySchema } from '../validators/index.js';
import { success, error } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';

const galleryRoutes = new Hono();

// GET /api/gallery — Public
galleryRoutes.get('/', async (c) => {
  const category = c.req.query('category');

  let query = db.select().from(galleryItems);
  if (category) {
    query = query.where(eq(galleryItems.category, category)) as any;
  }

  const data = await query.orderBy(galleryItems.sortOrder, desc(galleryItems.createdAt));
  return success(c, data);
});

// POST /api/gallery/admin — Create
galleryRoutes.post('/admin', authMiddleware, zValidator('json', createGallerySchema), async (c) => {
  const body = c.req.valid('json');
  const [item] = await db.insert(galleryItems).values(body).returning();
  return success(c, item, 201);
});

// DELETE /api/gallery/admin/:id — Delete
galleryRoutes.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning();

  if (!deleted) {
    return error(c, 'Item galeri tidak ditemukan', 404);
  }

  return success(c, { message: 'Item galeri berhasil dihapus' });
});

export default galleryRoutes;
