import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, desc, asc, ilike, sql, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { products } from '../db/schema.js';
import { createProductSchema, updateProductSchema } from '../validators/index.js';
import { success, error, paginated } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';

const productRoutes = new Hono();

// ============================================================
// Public Routes
// ============================================================

// GET /api/products — List products (public)
productRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '12');
  const category = c.req.query('category');
  const search = c.req.query('search');
  const offset = (page - 1) * limit;

  const conditions = [eq(products.isAvailable, true)];

  if (category) {
    conditions.push(eq(products.category, category as any));
  }
  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db.select().from(products).where(where).orderBy(asc(products.sortOrder), desc(products.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  return paginated(c, data, Number(countResult[0].count), page, limit);
});

// GET /api/products/:slug — Product detail (public)
productRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product) {
    return error(c, 'Produk tidak ditemukan', 404);
  }

  return success(c, product);
});

// ============================================================
// Admin Routes
// ============================================================

// POST /api/admin/products — Create product
productRoutes.post('/admin', authMiddleware, zValidator('json', createProductSchema), async (c) => {
  const body = c.req.valid('json');
  const slug = slugify(body.name);

  // Check slug uniqueness
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
  if (existing) {
    return error(c, 'Produk dengan nama serupa sudah ada', 409);
  }

  const [product] = await db.insert(products).values({
    ...body,
    slug,
  }).returning();

  return success(c, product, 201);
});

// PUT /api/admin/products/:id — Update product
productRoutes.put('/admin/:id', authMiddleware, zValidator('json', updateProductSchema), async (c) => {
  const id = c.req.param('id') as string;
  const body = c.req.valid('json');

  const updateData: any = { ...body, updatedAt: new Date() };
  if (body.name) {
    updateData.slug = slugify(body.name);
  }

  const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();

  if (!product) {
    return error(c, 'Produk tidak ditemukan', 404);
  }

  return success(c, product);
});

// DELETE /api/admin/products/:id — Delete product
productRoutes.delete('/admin/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;

  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();

  if (!deleted) {
    return error(c, 'Produk tidak ditemukan', 404);
  }

  return success(c, { message: 'Produk berhasil dihapus' });
});

// GET /api/products/admin/all — List all products for admin (including unavailable)
productRoutes.get('/admin/all', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(products).orderBy(asc(products.sortOrder), desc(products.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products),
  ]);

  return paginated(c, data, Number(countResult[0].count), page, limit);
});

export default productRoutes;
