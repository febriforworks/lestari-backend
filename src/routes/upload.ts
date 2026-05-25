import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';
import { createClient } from '@supabase/supabase-js';

const uploadRoutes = new Hono();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// POST /api/upload — Upload image via Supabase Storage
uploadRoutes.post('/', authMiddleware, async (c) => {
  if (!supabaseUrl || !supabaseKey) {
    return error(c, 'Supabase Storage belum dikonfigurasi. Silakan input URL gambar secara manual.', 503);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return error(c, 'File tidak ditemukan');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return error(c, 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.');
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return error(c, 'Ukuran file maksimal 5MB');
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error: uploadError } = await supabase.storage
      .from('lestari-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return error(c, `Upload gagal: ${uploadError.message}`, 500);
    }

    const { data: urlData } = supabase.storage
      .from('lestari-media')
      .getPublicUrl(filePath);

    return success(c, {
      url: urlData.publicUrl,
      path: filePath,
      fileName: file.name,
      size: file.size,
    }, 201);
  } catch (err: any) {
    return error(c, `Upload error: ${err.message}`, 500);
  }
});

export default uploadRoutes;
