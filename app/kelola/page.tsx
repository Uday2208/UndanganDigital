import { notFound } from "next/navigation";
import { verifyManagementKey } from "@/lib/admin-auth";
import { getFamilies, getGallery, getWedding } from "@/lib/wedding";
import { ManageForm } from "@/components/ManageForm";
import { DividerOrnament } from "@/components/Ornament";

export const revalidate = 0;

export default async function KelolaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawKey = typeof params.key === "string" ? params.key : null;

  // Jika key tidak valid / tidak ada -> Tampilkan 404 Not Found
  if (!verifyManagementKey(rawKey)) {
    notFound();
  }

  const wedding = await getWedding();
  if (!wedding) {
    notFound();
  }

  const [galleryItems, families] = await Promise.all([
    getGallery(wedding.id, 50),
    getFamilies(wedding.id),
  ]);

  return (
    <main className="min-h-dvh bg-ink text-cream py-10 px-4">
      <div className="mx-auto max-w-[560px] bg-ink-soft border border-gold/30 p-6 sm:p-8 rounded-sm space-y-8">
        <header className="text-center space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-mist">Kelola Data Undangan</p>
          <h1 className="font-serif text-3xl text-gold-light">Pengaturan Acara</h1>
          <DividerOrnament />
        </header>

        <ManageForm
          secretKey={rawKey!}
          wedding={wedding}
          initialGallery={galleryItems}
          initialFamilies={families}
        />
      </div>
    </main>
  );
}
