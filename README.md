# Undangan Pernikahan Digital — Modern Ethnic Luxury

Aplikasi Web Undangan Pernikahan Digital dengan tema **Black + Gold + Ethnic + Luxury + Romantic**. Dibuat menggunakan Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Prisma ORM, dan MySQL (XAMPP).

---

## 1. Requirements

- **Node.js**: v18.x atau lebih baru (Disarankan LTS / v20+)
- **npm**: v9.x atau lebih baru
- **XAMPP**: dengan modul MySQL / MariaDB berjalan pada port 3306

---

## 2. XAMPP Setup

1. Buka **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **MySQL**.
3. Pastikan status MySQL menunjukkan warna hijau dan port `3306` aktif.
4. (Opsional) Buka phpMyAdmin di browser: `http://localhost/phpmyadmin` untuk memverifikasi koneksi.

---

## 3. MySQL Configuration

Pastikan service MySQL XAMPP aktif. Secara default pada XAMPP:
- Host: `localhost`
- Port: `3306`
- Username: `root`
- Password: *(kosong)*

---

## 4. Database Creation

Buat database baru bernama `wedding_invitation`:

- Via phpMyAdmin: Buka tab **Databases**, masukkan nama `wedding_invitation` dengan Utf8mb4 collation (`utf8mb4_unicode_ci`), lalu klik **Create**.
- Atau via MySQL Command Line / Terminal:
  ```sql
  CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

---

## 5. DATABASE_URL & Environment Variables

Buat file `.env` di root project (gunakan `.env.example` sebagai panduan):

```env
DATABASE_URL="mysql://root:@localhost:3306/wedding_invitation"
WEDDING_SLUG="ucok-buet"
```

*Jika MySQL Anda memiliki password:*
```env
DATABASE_URL="mysql://root:PASSWORD_ANDA@localhost:3306/wedding_invitation"
```

> ⚠️ **PENTING**: File `.env` berisi rahasia koneksi dan **TIDAK BOLEH** dicommit ke Git repository.

---

## 6. npm install

Jalankan perintah berikut di terminal untuk memasang seluruh dependency:

```bash
npm install
```

---

## 7. Prisma Generate

Menghasilkan Prisma Client berdasarkan `prisma/schema.prisma`:

```bash
npx prisma generate
```

---

## 8. Prisma Migrate

Menjalankan migrasi database ke MySQL XAMPP:

```bash
npx prisma migrate dev
```

---

## 9. Prisma Seed

Mengisi database dengan data demo awal (Ucok & Buet):

```bash
npx prisma db seed
```

---

## 10. Development Server

Jalankan server pengembangan lokal Next.js:

```bash
npm run dev
```

Buka `http://localhost:3000` di browser Anda.
Untuk menguji nama tamu pada undangan:
`http://localhost:3000?kpd=Bapak+Budi`

---

## 11. Build Verification

Memverifikasi kode dengan TypeScript/ESLint linting dan membuat paket produksi:

```bash
npm run lint
npm run build
```

---

## 12. Vercel Deployment

1. Push repository ke GitHub.
2. Import repository di [Vercel](https://vercel.com).
3. Konfigurasikan Environment Variables pada dashboard Vercel:
   - `DATABASE_URL`: URL koneksi MySQL online yang kompatibel (misalnya PlanetScale, Aiven, Railway, Supabase MySQL, dll.).
   - `WEDDING_SLUG`: Slug wedding yang aktif (contoh: `ucok-buet`).
4. `postinstall` script di `package.json` (`prisma generate`) akan otomatis dijalankan oleh Vercel saat build.

---

## 13. Summary of Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | String koneksi Prisma ke MySQL database | `mysql://root:@localhost:3306/wedding_invitation` |
| `WEDDING_SLUG` | Slug identifikator acara pernikahan yang aktif | `ucok-buet` |

---

## Security & Architecture Highlights

- **Database Integrity**: Primary keys menggunakan `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`. Seluruh relasi child (gallery, family, wishes) menggunakan `ON DELETE CASCADE`.
- **Data Hardcoding Prohibition**: Tidak ada data pengantin, lokasi, tanggal, rekening, atau ucapan yang di-hardcode di UI components. Semua dibaca dari MySQL melalui Server Components.
- **XSS & SQL Injection Protection**: Semua ucapan tamu dianggap sebagai plain-text. Tidak ada `dangerouslySetInnerHTML` untuk konten user. Prisma menangani parametrizasi query secara aman.
- **Server Validation**: Form ucapan divalidasi server-side dengan `zod` schema (whitelisting fields, length caps, honeypot).
- **Client Components Scoped**: Hanya komponen interaktif (Countdown, Lightbox, Copy, Music, Form) yang menggunakan `"use client"`. Server Component digunakan sebagai default.
