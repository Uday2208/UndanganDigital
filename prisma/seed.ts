/**
 * Seed data DEMO. Satu-satunya tempat data demo wedding berada.
 * UI membaca semuanya dari database (MySQL).
 */
import { Attendance, FamilySide, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = process.env.WEDDING_SLUG ?? "ucok-buet";

async function main() {
  // Idempotent: hapus wedding demo lama (child ikut terhapus via ON DELETE CASCADE).
  await prisma.wedding.deleteMany({ where: { slug: SLUG } });

  const wedding = await prisma.wedding.create({
    data: {
      slug: SLUG,
      groomName: "Ucok",
      groomFullName: "Ucok Pratama Siregar",
      groomParents: "Putra dari Bapak Ramli Siregar & Ibu Marlina Hutapea",
      groomPhoto: "/images/groom.jpg",
      brideName: "Buet",
      brideFullName: "Buet Anggraini Nasution",
      brideParents: "Putri dari Bapak Hasan Nasution & Ibu Rosmawati Lubis",
      bridePhoto: "/images/couple-2.jpg",
      coverImage: "/images/cover.jpg",
      quote:
        "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya.",
      quoteSource: "QS. Ar-Rum: 21",
      weddingDate: new Date("2026-12-19T00:00:00.000Z"),
      akadDate: new Date("2026-12-19T00:00:00.000Z"),
      receptionDate: new Date("2026-12-20T00:00:00.000Z"),
      akadTime: new Date("1970-01-01T08:00:00.000Z"),
      receptionTime: new Date("1970-01-01T11:00:00.000Z"),
      receptionEndTime: new Date("1970-01-01T14:00:00.000Z"),
      timezone: "Asia/Jakarta",
      familyTitle: "Turut Mengundang",

      venueName: "Gedung Serbaguna Nusantara",
      venueAddress: "Jl. Merdeka No. 10, Medan, Sumatera Utara",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Medan+Sumatera+Utara",
      bankName: "Bank Contoh",
      bankAccountNumber: "1234567890",
      bankAccountHolder: "Ucok Pratama Siregar",
      ewalletName: "E-Wallet Contoh",
      ewalletNumber: "081234567890",
      ewalletHolder: "Buet Anggraini Nasution",
      qrisImage: null,
      musicUrl: null,
      musicTitle: null,
      gallery: {
        create: [
          { imageUrl: "/images/groom.jpg", altText: "Foto Mempelai Pria", width: 1024, height: 1024, sortOrder: 1 },
          { imageUrl: "/images/couple-2.jpg", altText: "Foto Mempelai Wanita", width: 1024, height: 1024, sortOrder: 2 },
          { imageUrl: "/images/couple-1.jpg", altText: "Foto Mempelai Berdua 1", width: 1024, height: 1024, sortOrder: 3 },
          { imageUrl: "/images/couple-3.jpg", altText: "Foto Mempelai Berpasangan", width: 1024, height: 1024, sortOrder: 4 },
          { imageUrl: "/images/couple-4.jpg", altText: "Foto Mempelai Berdua 2", width: 1024, height: 1024, sortOrder: 5 },
        ],
      },
      families: {
        create: [
          { side: FamilySide.pria, name: "Bapak Ramli Siregar", role: "Ayah mempelai pria", sortOrder: 1 },
          { side: FamilySide.pria, name: "Ibu Marlina Hutapea", role: "Ibu mempelai pria", sortOrder: 2 },
          { side: FamilySide.wanita, name: "Bapak Hasan Nasution", role: "Ayah mempelai wanita", sortOrder: 1 },
          { side: FamilySide.wanita, name: "Ibu Rosmawati Lubis", role: "Ibu mempelai wanita", sortOrder: 2 },
        ],
      },
      wishes: {
        create: [
          { guestName: "Keluarga Besar", message: "Selamat menempuh hidup baru, semoga samawa.", attendance: Attendance.hadir },
          { guestName: "Sahabat Lama", message: "Maaf belum bisa hadir, doa terbaik untuk kalian berdua.", attendance: Attendance.tidak_hadir },
        ],
      },
    },
  });

  console.log(`Seed OK: wedding id=${wedding.id} slug=${wedding.slug}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error instanceof Error ? error.message : "unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
