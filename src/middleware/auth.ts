import type { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt.js';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: Token tidak ditemukan' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ success: false, error: 'Unauthorized: Token tidak valid' }, 401);
  }

  c.set('userId', payload.id);
  c.set('userEmail', payload.email);

  await next();
}
