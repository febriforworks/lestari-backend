import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, sql, and, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { blogPosts } from '../db/schema.js';
import { createBlogSchema, updateBlogSchema } from '../validators/index.js';
import { success, error, paginated } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';

const blogRoutes = new Hono();

// ============================================================
// Public Routes
// ============================================================

// GET /api/blog — List published posts
blogRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '9');
  const category = c.req.query('category');
  const offset = (page - 1) * limit;

  const conditions = [eq(blogPosts.status, 'published')];
  if (category) {
    conditions.push(eq(blogPosts.category, category));
  }

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      thumbnailUrl: blogPosts.thumbnailUrl,
      category: blogPosts.category,
      author: blogPosts.author,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
    }).from(blogPosts).where(where).orderBy(desc(blogPosts.publishedAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(where),
  ]);

  return paginated(c, data, Number(countResult[0].count), page, limit);
});

// GET /api/blog/:slug — Post detail
blogRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const post = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')),
  });

  if (!post) {
    return error(c, 'Artikel tidak ditemukan', 404);
  }

  return success(c, post);
});

// ============================================================
// Admin Routes
// ============================================================

// GET /api/blog/admin/all — All posts (incl drafts)
blogRoutes.get('/admin/all', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(blogPosts),
  ]);

  return paginated(c, data, Number(countResult[0].count), page, limit);
});

// POST /api/blog/admin — Create post
blogRoutes.post('/admin', authMiddleware, zValidator('json', createBlogSchema), async (c) => {
  const body = c.req.valid('json');
  const slug = slugify(body.title);

  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });
  if (existing) {
    return error(c, 'Artikel dengan judul serupa sudah ada', 409);
  }

  const [post] = await db.insert(blogPosts).values({
    ...body,
    slug,
    publishedAt: body.status === 'published' ? new Date() : null,
  }).returning();

  return success(c, post, 201);
});

// PUT /api/blog/admin/:id — Update post
blogRoutes.put('/admin/:id', authMiddleware, zValidator('json', updateBlogSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const updateData: any = { ...body, updatedAt: new Date() };
  if (body.title) {
    updateData.slug = slugify(body.title);
  }
  if (body.status === 'published') {
    // Set publishedAt only if it wasn't already published
    const existing = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  const [post] = await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id)).returning();

  if (!post) {
    return error(c, 'Artikel tidak ditemukan', 404);
  }

  return success(c, post);
});

// DELETE /api/blog/admin/:id — Delete post
blogRoutes.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const [deleted] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();

  if (!deleted) {
    return error(c, 'Artikel tidak ditemukan', 404);
  }

  return success(c, { message: 'Artikel berhasil dihapus' });
});

export default blogRoutes;
