import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Inter } from "next/font/google";
import { getWedding } from "@/lib/wedding";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const script = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0A0A",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const wedding = await getWedding();
    if (wedding) {
      const title = `The Wedding of ${wedding.groomName} & ${wedding.brideName}`;
      return {
        title,
        description: `Undangan pernikahan ${wedding.groomFullName} dan ${wedding.brideFullName}.`,
        openGraph: { title, type: "website", locale: "id_ID" },
      };
    }
  } catch {
    // Gagal memuat data: pakai metadata generik (tanpa membocorkan detail error).
  }
  return {
    title: "Undangan Pernikahan",
    description: "Undangan pernikahan digital.",
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body className="bg-ink font-sans text-cream antialiased">{children}</body>
    </html>
  );
}
