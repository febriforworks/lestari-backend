import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { adminUsers } from '../db/schema.js';
import { loginSchema } from '../validators/index.js';
import { signToken } from '../utils/jwt.js';
import { success, error } from '../utils/response.js';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email),
  });

  if (!user) {
    return error(c, 'Email atau password salah', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return error(c, 'Email atau password salah', 401);
  }

  const token = await signToken({ id: user.id, email: user.email });

  return success(c, {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return error(c, 'User tidak ditemukan', 404);
  }

  return success(c, user);
});

export default auth;
