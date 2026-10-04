export type AttendanceValue = "hadir" | "tidak_hadir";
export type FamilySideValue = "pria" | "wanita";

export const ATTENDANCE_VALUES = ["hadir", "tidak_hadir"] as const;

/** Data wedding yang aman dikirim ke browser (tanpa BigInt, tanpa field internal). */
export interface PublicWedding {
  id: number;
  slug: string;
  groomName: string;
  groomFullName: string;
  groomParents: string;
  groomPhoto: string | null;
  brideName: string;
  brideFullName: string;
  brideParents: string;
  bridePhoto: string | null;
  coverImage: string | null;
  quote: string | null;
  quoteSource: string | null;
  /** YYYY-MM-DD */
  weddingDate: string;
  akadDate: string;
  receptionDate: string;
  /** HH:mm */
  akadTime: string;
  receptionTime: string;
  receptionEndTime: string | null;
  timezone: string;
  familyTitle: string;
  /** ISO 8601 dengan offset timezone wedding, aman diparse lintas browser. */
  akadAt: string;
  receptionAt: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  ewalletName: string | null;
  ewalletNumber: string | null;
  ewalletHolder: string | null;
  qrisImage: string | null;
  musicUrl: string | null;
  musicTitle: string | null;
}

export interface PublicGalleryItem {
  id: number;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface PublicFamily {
  id: number;
  side: FamilySideValue;
  name: string;
  role: string;
  sortOrder: number;
}

export interface PublicWish {
  id: number;
  guestName: string;
  message: string;
  attendance: AttendanceValue;
  /** ISO 8601 UTC */
  createdAt: string;
}

export interface WishPage {
  items: PublicWish[];
  nextCursor: string | null;
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
