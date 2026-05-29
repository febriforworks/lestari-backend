import { Hono } from 'hono';
import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const router = new Hono();

// All transaction routes require authentication
router.use('/*', authMiddleware);

// Validation schema for creating/updating a transaction
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.enum([
    'penjualan_ternak', 'penjualan_bibit', 'penjualan_qurban', 'produk_sampingan', 'pemasukan_lainnya',
    'pakan', 'kesehatan', 'operasional', 'pembelian_bibit', 'gaji', 'pengeluaran_lainnya'
  ]),
  amount: z.number().positive(),
  description: z.string().optional().default(''),
  date: z.string().datetime().optional()
});

// GET /api/transactions/admin/summary
// Get total income, total expense, and balance (optionally filtered by month/year)
router.get('/admin/summary', async (c) => {
  const month = c.req.query('month');
  const year = c.req.query('year');

  let dateFilter = undefined;
  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    dateFilter = and(gte(transactions.date, startDate), lte(transactions.date, endDate));
  } else if (year) {
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
    dateFilter = and(gte(transactions.date, startDate), lte(transactions.date, endDate));
  }

  try {
    const summary = await db
      .select({
        type: transactions.type,
        total: sql<number>`cast(sum(${transactions.amount}) as integer)`
      })
      .from(transactions)
      .where(dateFilter)
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach(row => {
      if (row.type === 'income') totalIncome = row.total || 0;
      if (row.type === 'expense') totalExpense = row.total || 0;
    });

    return c.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /api/transactions/admin
// Get all transactions with optional pagination and filtering
router.get('/admin', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const typeFilter = c.req.query('type') as 'income' | 'expense' | undefined;
  const month = c.req.query('month');
  const year = c.req.query('year');

  const conditions = [];
  if (typeFilter) conditions.push(eq(transactions.type, typeFilter));

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    conditions.push(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const items = await db.query.transactions.findMany({
      where: whereClause,
      orderBy: [desc(transactions.date), desc(transactions.createdAt)],
      limit,
      offset,
    });

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(${transactions.id}) as integer)` })
      .from(transactions)
      .where(whereClause);

    return c.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: offset + limit < count,
        hasPrev: page > 1,
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/transactions/admin
// Create a new transaction
router.post('/admin', zValidator('json', transactionSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    const newTransaction = await db.insert(transactions).values({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
    }).returning();

    return c.json({ success: true, data: newTransaction[0] }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/transactions/admin/:id
// Update an existing transaction
router.put('/admin/:id', zValidator('json', transactionSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  try {
    const updated = await db
      .update(transactions)
      .set({
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();

    if (updated.length === 0) {
      return c.json({ success: false, error: 'Transaksi tidak ditemukan' }, 404);
    }

    return c.json({ success: true, data: updated[0] });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/transactions/admin/:id
// Delete a transaction
router.delete('/admin/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const deleted = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    if (deleted.length === 0) {
      return c.json({ success: false, error: 'Transaksi tidak ditemukan' }, 404);
    }
    return c.json({ success: true, data: deleted[0] });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default router;
