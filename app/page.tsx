import { notFound } from "next/navigation";
import { Closing } from "@/components/Closing";
import { Couple } from "@/components/Couple";
import { Events } from "@/components/Events";
import { Families } from "@/components/Families";
import { Gallery } from "@/components/Gallery";
import { GiftSection } from "@/components/GiftSection";
import { Hero } from "@/components/Hero";
import { InvitationShell } from "@/components/InvitationShell";
import type { NavItem } from "@/components/BottomNav";
import { WishesSection } from "@/components/WishesSection";
import { formatDayName, formatLongDate } from "@/lib/datetime";
import { sanitizeGuestName } from "@/lib/guest";
import { getFamilies, getGallery, getWedding, getWishes } from "@/lib/wedding";

export const revalidate = 0; // Dynamic server component

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const guestName = sanitizeGuestName(params.kpd);

  const wedding = await getWedding();
  if (!wedding) {
    notFound();
  }

  const [galleryItems, families, wishData] = await Promise.all([
    getGallery(wedding.id),
    getFamilies(wedding.id),
    getWishes(wedding.id),
  ]);

  const dateLabel = `${formatDayName(wedding.receptionDate)}, ${formatLongDate(wedding.receptionDate)}`;

  const hasGift = Boolean(
    wedding.bankAccountNumber || wedding.ewalletNumber || wedding.qrisImage
  );

  const navItems: NavItem[] = [
    { id: "home", label: "Pembuka", icon: "home" },
    { id: "couple", label: "Mempelai", icon: "couple" },
    { id: "event", label: "Acara", icon: "event" },
  ];

  if (galleryItems.length > 0) {
    navItems.push({ id: "gallery", label: "Galeri", icon: "gallery" });
  }

  if (hasGift) {
    navItems.push({ id: "gift", label: "Hadiah", icon: "gift" });
  }

  navItems.push({ id: "wishes", label: "Ucapan", icon: "wishes" });

  return (
    <InvitationShell
      groomName={wedding.groomName}
      brideName={wedding.brideName}
      dateLabel={dateLabel}
      guest={guestName}
      coverImage={wedding.coverImage}
      musicUrl={wedding.musicUrl}
      musicTitle={wedding.musicTitle}
      navItems={navItems}
    >
      <Hero wedding={wedding} />
      <Couple wedding={wedding} />
      <Events wedding={wedding} />
      <Families wedding={wedding} families={families} />
      <Gallery items={galleryItems} />
      <GiftSection
        bankName={wedding.bankName}
        bankAccountNumber={wedding.bankAccountNumber}
        bankAccountHolder={wedding.bankAccountHolder}
        ewalletName={wedding.ewalletName}
        ewalletNumber={wedding.ewalletNumber}
        ewalletHolder={wedding.ewalletHolder}
        qrisImage={wedding.qrisImage}
      />
      <WishesSection
        initialItems={wishData.items}
        initialCursor={wishData.nextCursor}
        timezone={wedding.timezone}
        defaultName={guestName === "Bapak/Ibu/Saudara/i" ? "" : guestName}
      />
      <Closing wedding={wedding} />
    </InvitationShell>
  );
}
