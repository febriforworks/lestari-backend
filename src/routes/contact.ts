import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { contactMessages } from '../db/schema.js';
import { contactMessageSchema } from '../validators/index.js';
import { success, error, paginated } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';

const contactRoutes = new Hono();

// POST /api/contact — Submit message (public)
contactRoutes.post('/', zValidator('json', contactMessageSchema), async (c) => {
  const body = c.req.valid('json');

  const [message] = await db.insert(contactMessages).values(body).returning();

  return success(c, { message: 'Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.' }, 201);
});

// GET /api/contact/admin/messages — List messages (admin)
contactRoutes.get('/admin/messages', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(contactMessages),
  ]);

  return paginated(c, data, Number(countResult[0].count), page, limit);
});

// PATCH /api/contact/admin/messages/:id/read — Mark as read
contactRoutes.patch('/admin/messages/:id/read', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;

  const [updated] = await db.update(contactMessages)
    .set({ isRead: true, updatedAt: new Date() })
    .where(eq(contactMessages.id, id))
    .returning();

  if (!updated) {
    return error(c, 'Pesan tidak ditemukan', 404);
  }

  return success(c, updated);
});

// DELETE /api/contact/admin/messages/:id — Delete message
contactRoutes.delete('/admin/messages/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const [deleted] = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();

  if (!deleted) {
    return error(c, 'Pesan tidak ditemukan', 404);
  }

  return success(c, { message: 'Pesan berhasil dihapus' });
});

export default contactRoutes;
