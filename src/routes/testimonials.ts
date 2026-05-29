import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { testimonials } from '../db/schema.js';
import { createTestimonialSchema, updateTestimonialSchema } from '../validators/index.js';
import { success, error, paginated } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';

const testimonialRoutes = new Hono();

// GET /api/testimonials — Public (visible only)
testimonialRoutes.get('/', async (c) => {
  const data = await db.select().from(testimonials)
    .where(eq(testimonials.isVisible, true))
    .orderBy(desc(testimonials.createdAt));

  return success(c, data);
});

// GET /api/testimonials/admin/all — All for admin
testimonialRoutes.get('/admin/all', authMiddleware, async (c) => {
  const data = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  return success(c, data);
});

// POST /api/testimonials/admin — Create
testimonialRoutes.post('/admin', authMiddleware, zValidator('json', createTestimonialSchema), async (c) => {
  const body = c.req.valid('json');
  const [testimonial] = await db.insert(testimonials).values(body).returning();
  return success(c, testimonial, 201);
});

// PUT /api/testimonials/admin/:id — Update
testimonialRoutes.put('/admin/:id', authMiddleware, zValidator('json', updateTestimonialSchema), async (c) => {
  const id = c.req.param('id') as string;
  const body = c.req.valid('json');

  const [testimonial] = await db.update(testimonials)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();

  if (!testimonial) {
    return error(c, 'Testimoni tidak ditemukan', 404);
  }

  return success(c, testimonial);
});

// DELETE /api/testimonials/admin/:id — Delete
testimonialRoutes.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const [deleted] = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();

  if (!deleted) {
    return error(c, 'Testimoni tidak ditemukan', 404);
  }

  return success(c, { message: 'Testimoni berhasil dihapus' });
});

export default testimonialRoutes;
