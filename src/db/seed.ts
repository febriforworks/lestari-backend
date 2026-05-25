import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // 1. Create Admin User
  // ============================================================
  const passwordHash = await bcrypt.hash('admin123', 10);

  await db.insert(schema.adminUsers).values({
    email: 'admin@lestarifarm.com',
    passwordHash,
    name: 'Admin Lestari Farm',
  }).onConflictDoNothing();

  console.log('✅ Admin user created (admin@lestarifarm.com / admin123)');

  // ============================================================
  // 2. Seed Products
  // ============================================================
  const productData = [
    {
      name: 'Domba Garut Super',
      slug: 'domba-garut-super',
      description: 'Domba Garut unggulan dengan postur tubuh besar dan kokoh. Cocok untuk fattening maupun breeding. Domba Garut terkenal dengan kerangka tubuh yang kuat dan daging yang berkualitas tinggi.',
      category: 'domba' as const,
      priceMin: 2500000,
      priceMax: 4500000,
      weightRange: '30-45 kg',
      ageRange: '8-14 bulan',
      isAvailable: true,
      sortOrder: 1,
    },
    {
      name: 'Domba Ekor Tipis',
      slug: 'domba-ekor-tipis',
      description: 'Domba lokal dengan adaptasi yang baik terhadap lingkungan tropis. Mudah dipelihara dan memiliki daya tahan tinggi terhadap penyakit. Pilihan tepat bagi peternak pemula.',
      category: 'domba' as const,
      priceMin: 1800000,
      priceMax: 3000000,
      weightRange: '25-35 kg',
      ageRange: '6-12 bulan',
      isAvailable: true,
      sortOrder: 2,
    },
    {
      name: 'Kambing Etawa Premium',
      slug: 'kambing-etawa-premium',
      description: 'Kambing Etawa dengan performa produksi susu tinggi dan postur yang gagah. Sangat cocok untuk usaha peternakan susu kambing. Berasal dari indukan terbaik di peternakan kami.',
      category: 'kambing' as const,
      priceMin: 3500000,
      priceMax: 7000000,
      weightRange: '40-60 kg',
      ageRange: '10-18 bulan',
      isAvailable: true,
      sortOrder: 3,
    },
    {
      name: 'Kambing Kacang',
      slug: 'kambing-kacang',
      description: 'Kambing lokal Indonesia yang tangguh dan mudah beradaptasi. Ukuran tubuh compact namun produktif. Sangat cocok untuk pemeliharaan di pedesaan dengan pakan alami.',
      category: 'kambing' as const,
      priceMin: 1500000,
      priceMax: 2500000,
      weightRange: '20-30 kg',
      ageRange: '6-10 bulan',
      isAvailable: true,
      sortOrder: 4,
    },
    {
      name: 'Paket Qurban Domba',
      slug: 'paket-qurban-domba',
      description: 'Domba qurban berkualitas sesuai syariat Islam. Usia cukup, sehat, tidak cacat, dan telah mendapat perawatan optimal. Tersedia layanan pemotongan dan pengantaran.',
      category: 'qurban' as const,
      priceMin: 2800000,
      priceMax: 5000000,
      weightRange: '30-50 kg',
      ageRange: '12-24 bulan',
      isAvailable: true,
      sortOrder: 5,
    },
    {
      name: 'Paket Qurban Kambing',
      slug: 'paket-qurban-kambing',
      description: 'Kambing qurban pilihan yang memenuhi kriteria syariat. Kondisi sehat prima, bobot ideal, dan siap untuk ibadah qurban Anda. Dilengkapi sertifikat kesehatan.',
      category: 'qurban' as const,
      priceMin: 2500000,
      priceMax: 4500000,
      weightRange: '25-45 kg',
      ageRange: '12-24 bulan',
      isAvailable: true,
      sortOrder: 6,
    },
    {
      name: 'Bibit Domba Dorper',
      slug: 'bibit-domba-dorper',
      description: 'Bibit domba Dorper berkualitas untuk program breeding. Ras Dorper dikenal dengan pertumbuhan cepat dan kualitas daging premium. Ideal untuk meningkatkan genetik peternakan Anda.',
      category: 'bibit' as const,
      priceMin: 4000000,
      priceMax: 8000000,
      weightRange: '35-50 kg',
      ageRange: '6-12 bulan',
      isAvailable: true,
      sortOrder: 7,
    },
    {
      name: 'Bibit Kambing Peranakan Etawa (PE)',
      slug: 'bibit-kambing-peranakan-etawa',
      description: 'Bibit kambing PE pilihan dari indukan berproduksi susu tinggi. Cocok untuk peternakan kambing perah maupun pedaging. Dilengkapi catatan silsilah dan kesehatan.',
      category: 'bibit' as const,
      priceMin: 3000000,
      priceMax: 6000000,
      weightRange: '30-45 kg',
      ageRange: '6-10 bulan',
      isAvailable: true,
      sortOrder: 8,
    },
  ];

  for (const product of productData) {
    await db.insert(schema.products).values(product).onConflictDoNothing();
  }
  console.log(`✅ ${productData.length} products seeded`);

  // ============================================================
  // 3. Seed Blog Posts
  // ============================================================
  const blogData = [
    {
      title: 'Panduan Lengkap Memulai Peternakan Domba untuk Pemula',
      slug: 'panduan-memulai-peternakan-domba-pemula',
      content: `<h2>Mengapa Beternak Domba?</h2>
<p>Peternakan domba merupakan salah satu peluang usaha yang menjanjikan di Indonesia. Dengan modal yang relatif terjangkau dan perawatan yang tidak terlalu rumit, beternak domba bisa menjadi sumber penghasilan yang stabil bagi masyarakat desa.</p>

<h2>Persiapan Awal</h2>
<p>Sebelum memulai, ada beberapa hal yang perlu Anda siapkan:</p>
<ul>
<li><strong>Lokasi Kandang:</strong> Pilih lokasi yang kering, memiliki sirkulasi udara baik, dan jauh dari pemukiman padat.</li>
<li><strong>Modal Awal:</strong> Siapkan budget untuk pembelian bibit, pembangunan kandang, dan pakan minimal 3 bulan pertama.</li>
<li><strong>Pengetahuan Dasar:</strong> Pelajari karakteristik domba, pola makan, dan tanda-tanda penyakit umum.</li>
</ul>

<h2>Pemilihan Bibit Domba</h2>
<p>Pilih bibit dari sumber terpercaya. Perhatikan postur tubuh, kesehatan mata, bulu yang bersih, dan nafsu makan yang baik. Di Lestari Farm, kami menyediakan bibit domba berkualitas dengan catatan kesehatan lengkap.</p>

<h2>Manajemen Pakan</h2>
<p>Domba membutuhkan pakan hijauan (rumput, daun-daunan) dan konsentrat. Pastikan ketersediaan air bersih setiap saat. Pemberian pakan fermentasi dapat meningkatkan efisiensi pakan dan pertumbuhan.</p>

<h2>Tips Sukses Beternak</h2>
<ol>
<li>Mulai dari skala kecil (5-10 ekor)</li>
<li>Catat semua pengeluaran dan pemasukan</li>
<li>Bergabung dengan komunitas peternak</li>
<li>Rutin konsultasi dengan dokter hewan</li>
<li>Jaga kebersihan kandang setiap hari</li>
</ol>

<p>Hubungi Lestari Farm untuk konsultasi gratis mengenai cara memulai peternakan domba Anda!</p>`,
      excerpt: 'Pelajari langkah-langkah praktis memulai peternakan domba dari nol. Dari persiapan kandang, pemilihan bibit, hingga manajemen pakan yang efisien.',
      category: 'edukasi',
      status: 'published' as const,
      publishedAt: new Date('2026-05-20'),
      author: 'Admin Lestari Farm',
    },
    {
      title: 'Mengenal Jenis-Jenis Kambing Unggulan di Indonesia',
      slug: 'jenis-kambing-unggulan-indonesia',
      content: `<h2>Keanekaragaman Kambing di Indonesia</h2>
<p>Indonesia memiliki beragam jenis kambing yang masing-masing memiliki keunggulan tersendiri. Mengenal karakteristik setiap ras akan membantu Anda memilih kambing yang sesuai dengan tujuan peternakan.</p>

<h2>1. Kambing Etawa (Peranakan Etawa/PE)</h2>
<p>Kambing PE merupakan hasil persilangan kambing lokal dengan kambing Jamnapari dari India. Dikenal dengan telinga panjang terkulai dan postur tubuh besar. Kambing ini dual purpose - baik untuk produksi susu maupun daging.</p>

<h2>2. Kambing Kacang</h2>
<p>Kambing asli Indonesia yang berukuran kecil namun sangat adaptif. Tahan terhadap berbagai kondisi lingkungan dan penyakit. Sangat populer di kalangan peternak skala kecil di pedesaan.</p>

<h2>3. Kambing Boer</h2>
<p>Kambing tipe pedaging dengan pertumbuhan sangat cepat. Berasal dari Afrika Selatan, kambing Boer cocok untuk program penggemukan (fattening) karena konversi pakan yang efisien.</p>

<h2>4. Kambing Saanen</h2>
<p>Kambing perah terbaik dunia asal Swiss. Produksi susunya bisa mencapai 3-4 liter per hari. Namun membutuhkan perawatan ekstra karena kurang adaptif terhadap cuaca tropis yang panas.</p>

<h2>Rekomendasi untuk Peternak Pemula</h2>
<p>Untuk pemula, kami merekomendasikan Kambing Kacang atau Kambing PE karena perawatannya yang relatif mudah dan pasar yang sudah mapan. Kunjungi Lestari Farm untuk melihat langsung dan berkonsultasi tentang kambing yang cocok untuk Anda.</p>`,
      excerpt: 'Kenali berbagai jenis kambing unggulan di Indonesia beserta karakteristik dan keunggulannya untuk membantu Anda memilih ternak yang tepat.',
      category: 'edukasi',
      status: 'published' as const,
      publishedAt: new Date('2026-05-15'),
      author: 'Admin Lestari Farm',
    },
    {
      title: 'Potensi Peternakan sebagai Penggerak Ekonomi Desa',
      slug: 'potensi-peternakan-penggerak-ekonomi-desa',
      content: `<h2>Peternakan dan Pemberdayaan Desa</h2>
<p>Di tengah pesatnya urbanisasi, desa-desa di Indonesia menyimpan potensi besar yang belum tergarap optimal. Salah satunya adalah sektor peternakan yang mampu menjadi motor penggerak ekonomi lokal.</p>

<h2>Sinergi Peternakan dan Potensi Lokal</h2>
<p>Lestari Farm hadir di Desa Somokaton, Kecamatan Ngluwar, Magelang dengan misi mengangkat potensi lokal melalui peternakan modern. Dengan memanfaatkan lahan desa yang subur dan sumber pakan alami yang melimpah, kami membuktikan bahwa peternakan bisa menjadi tulang punggung ekonomi desa.</p>

<h2>Dampak Positif untuk Masyarakat</h2>
<ul>
<li><strong>Lapangan Kerja:</strong> Peternakan menciptakan peluang kerja bagi warga desa, dari pengelola kandang hingga pemasar produk.</li>
<li><strong>Rantai Pasok Lokal:</strong> Pakan ternak bisa diperoleh dari petani sekitar, menciptakan ekosistem ekonomi yang saling menguntungkan.</li>
<li><strong>Pupuk Organik:</strong> Kotoran ternak diolah menjadi pupuk organik berkualitas untuk pertanian warga.</li>
<li><strong>Eduwisata:</strong> Peternakan modern bisa menjadi destinasi edukasi yang menarik wisatawan.</li>
</ul>

<h2>Model Peternakan Berkelanjutan</h2>
<p>Kami menerapkan konsep integrated farming dimana setiap aspek peternakan saling terhubung. Limbah menjadi pupuk, lahan kosong ditanami rumput pakan, dan masyarakat dilibatkan dalam setiap tahapan.</p>

<h2>Bergabung Bersama Kami</h2>
<p>Mari bersama-sama membangun peternakan yang tidak hanya menguntungkan secara bisnis, tetapi juga memberdayakan masyarakat desa. Hubungi Lestari Farm untuk informasi kemitraan dan konsultasi.</p>`,
      excerpt: 'Bagaimana peternakan modern dapat menjadi penggerak ekonomi desa dan memberdayakan masyarakat lokal. Pengalaman Lestari Farm di Desa Somokaton, Magelang.',
      category: 'insight',
      status: 'published' as const,
      publishedAt: new Date('2026-05-10'),
      author: 'Admin Lestari Farm',
    },
  ];

  for (const post of blogData) {
    await db.insert(schema.blogPosts).values(post).onConflictDoNothing();
  }
  console.log(`✅ ${blogData.length} blog posts seeded`);

  // ============================================================
  // 4. Seed Testimonials
  // ============================================================
  const testimonialData = [
    {
      name: 'Pak Hardi',
      message: 'Domba dari Lestari Farm kualitasnya sangat bagus. Sudah 2 tahun saya berlangganan untuk kebutuhan qurban. Pelayanannya ramah dan ternak selalu dalam kondisi sehat.',
      rating: 5,
      isVisible: true,
    },
    {
      name: 'Bu Siti Aminah',
      message: 'Awalnya ragu mau beli kambing Etawa di sini, tapi setelah lihat langsung kondisi kandang dan ternaknya, saya yakin. Harganya juga transparan dan bisa diantar ke rumah.',
      rating: 5,
      isVisible: true,
    },
    {
      name: 'Mas Budi Santoso',
      message: 'Saya beli bibit domba 10 ekor untuk memulai peternakan kecil. Alhamdulillah dapat pendampingan dari tim Lestari Farm. Sekarang sudah berkembang jadi 25 ekor.',
      rating: 5,
      isVisible: true,
    },
    {
      name: 'Pak Joko Widodo',
      message: 'Peternakan yang profesional dan tertata rapi. Cocok untuk belajar beternak bagi pemula seperti saya. Terima kasih Lestari Farm!',
      rating: 4,
      isVisible: true,
    },
  ];

  for (const testimonial of testimonialData) {
    await db.insert(schema.testimonials).values(testimonial).onConflictDoNothing();
  }
  console.log(`✅ ${testimonialData.length} testimonials seeded`);

  // ============================================================
  // 5. Seed Site Settings
  // ============================================================
  const settingsData = [
    { key: 'site_name', value: 'Farmhaus Ternak Lestari' },
    { key: 'site_tagline', value: 'Peternakan Modern Berbasis Desa, Mengangkat Potensi Lokal' },
    { key: 'whatsapp_number', value: '6287839493744' },
    { key: 'email', value: 'info@lestarifarm.com' },
    { key: 'address', value: 'Somokaton RT 04, RW 01, Somokaton, Ngluwar, Magelang, Jawa Tengah' },
    { key: 'maps_url', value: 'https://maps.app.goo.gl/B9eXdc6acrYFPfVG7' },
    { key: 'instagram', value: '' },
    { key: 'facebook', value: '' },
    { key: 'youtube', value: '' },
    { key: 'operating_hours', value: 'Senin - Sabtu: 08:00 - 17:00 WIB' },
  ];

  for (const setting of settingsData) {
    await db.insert(schema.siteSettings)
      .values(setting)
      .onConflictDoNothing();
  }
  console.log(`✅ ${settingsData.length} site settings seeded`);

  console.log('\n🎉 Database seeding complete!');
  console.log('📧 Admin login: admin@lestarifarm.com');
  console.log('🔑 Admin password: admin123');
  console.log('\n⚠️  PENTING: Segera ganti password admin setelah login pertama kali!');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
