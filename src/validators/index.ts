import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional().default(''),
  category: z.enum(['domba', 'kambing', 'qurban', 'bibit']),
  priceMin: z.number().int().min(0),
  priceMax: z.number().int().min(0).optional().nullable(),
  imageUrl: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
  weightRange: z.string().optional().default(''),
  ageRange: z.string().optional().default(''),
  sortOrder: z.number().int().optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const createBlogSchema = z.object({
  title: z.string().min(1, 'Judul artikel wajib diisi'),
  content: z.string().min(1, 'Konten artikel wajib diisi'),
  excerpt: z.string().optional().default(''),
  thumbnailUrl: z.string().optional().default(''),
  category: z.string().optional().default('umum'),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  author: z.string().optional().default('Admin Lestari Farm'),
});

export const updateBlogSchema = createBlogSchema.partial();

export const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  message: z.string().min(1, 'Pesan wajib diisi'),
  photoUrl: z.string().optional().default(''),
  rating: z.number().int().min(1).max(5).optional().default(5),
  isVisible: z.boolean().optional().default(true),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const contactMessageSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional().default(''),
  message: z.string().min(1, 'Pesan wajib diisi'),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const createGallerySchema = z.object({
  title: z.string().optional().default(''),
  imageUrl: z.string().min(1, 'URL gambar wajib diisi'),
  category: z.string().optional().default('umum'),
  sortOrder: z.number().int().optional().default(0),
});

export const updateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
});
