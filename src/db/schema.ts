import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, json } from 'drizzle-orm/pg-core';

// ============================================================
// Enums
// ============================================================

export const productCategoryEnum = pgEnum('product_category', [
  'domba',
  'kambing',
  'qurban',
  'bibit',
]);

export const blogStatusEnum = pgEnum('blog_status', [
  'draft',
  'published',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
]);

export const transactionCategoryEnum = pgEnum('transaction_category', [
  // Income
  'penjualan_ternak',
  'penjualan_bibit',
  'penjualan_qurban',
  'produk_sampingan',
  'pemasukan_lainnya',
  // Expense
  'pakan',
  'kesehatan',
  'operasional',
  'pembelian_bibit',
  'gaji',
  'pengeluaran_lainnya',
]);

// ============================================================
// Products
// ============================================================

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull().default(''),
  category: productCategoryEnum('category').notNull(),
  priceMin: integer('price_min').notNull().default(0),
  priceMax: integer('price_max'),
  imageUrl: varchar('image_url', { length: 500 }).default(''),
  images: json('images').$type<string[]>().default([]),
  isAvailable: boolean('is_available').notNull().default(true),
  weightRange: varchar('weight_range', { length: 100 }).default(''),
  ageRange: varchar('age_range', { length: 100 }).default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Blog Posts
// ============================================================

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull().default(''),
  excerpt: varchar('excerpt', { length: 500 }).default(''),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).default(''),
  category: varchar('category', { length: 100 }).default('umum'),
  status: blogStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  author: varchar('author', { length: 255 }).default('Admin Lestari Farm'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Testimonials
// ============================================================

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  message: text('message').notNull(),
  photoUrl: varchar('photo_url', { length: 500 }).default(''),
  rating: integer('rating').notNull().default(5),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Contact Messages
// ============================================================

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).default(''),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Admin Users
// ============================================================

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Gallery Items
// ============================================================

export const galleryItems = pgTable('gallery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull().default(''),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  category: varchar('category', { length: 100 }).default('umum'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Site Settings
// ============================================================

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Transactions (Cash Flow)
// ============================================================

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: transactionTypeEnum('type').notNull(),
  category: transactionCategoryEnum('category').notNull(),
  amount: integer('amount').notNull(),
  description: text('description').notNull().default(''),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// Type exports
// ============================================================

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type NewGalleryItem = typeof galleryItems.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
