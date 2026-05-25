import type { Context } from 'hono';

export function success(c: Context, data: unknown, status = 200) {
  return c.json({ success: true, data }, status as any);
}

export function error(c: Context, message: string, status = 400) {
  return c.json({ success: false, error: message }, status as any);
}

export function paginated(
  c: Context,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
