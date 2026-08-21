import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews, type Review } from "@/lib/db/schema";

const AVATAR_COLORS = [
  "bg-[#1B7FE0]",
  "bg-[#0E9F8C]",
  "bg-[#8A5CF0]",
  "bg-[#D97726]",
  "bg-[#B04A8C]",
  "bg-[#2F9E44]",
  "bg-[#E8590C]",
  "bg-[#1971C2]",
];

/** İsimden deterministik bir avatar rengi üretir — admin her yorum için renk seçmek zorunda kalmaz. */
export function avatarColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** "review_date" alanından "4 ay önce" gibi göreli bir metin üretir — admin
 * her yorum eklediğinde elle "X ay önce" yazmak zorunda kalmaz, tarih
 * ilerledikçe metin otomatik güncel kalır. */
export function relativeTimeFromDate(isoDate: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY_MS));
  if (days < 1) return "Bugün";
  if (days < 30) return `${days} gün önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  const years = Math.floor(months / 12);
  return `${years} yıl önce`;
}

/** Public site için — yalnızca yayınlanan yorumlar, admin sıralamasına göre. */
export async function getPublishedReviews(): Promise<Review[]> {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.published, true))
    .orderBy(asc(reviews.sortOrder), desc(reviews.reviewDate));
}

/** Panel için — yayınlanmayanlar dahil hepsi. */
export async function listAllReviews(): Promise<Review[]> {
  return db.select().from(reviews).orderBy(asc(reviews.sortOrder), desc(reviews.reviewDate));
}

export async function createReview(
  data: {
    name: string;
    reviewText: string;
    rating: number;
    reviewDate: string;
    published: boolean;
    sortOrder: number;
  },
  updatedBy: number
): Promise<Review> {
  const [row] = await db.insert(reviews).values({ ...data, updatedBy }).returning();
  return row;
}

export async function updateReview(
  id: number,
  data: Partial<{
    name: string;
    reviewText: string;
    rating: number;
    reviewDate: string;
    published: boolean;
    sortOrder: number;
  }>,
  updatedBy: number
): Promise<Review | null> {
  const [row] = await db
    .update(reviews)
    .set({ ...data, updatedAt: new Date(), updatedBy })
    .where(eq(reviews.id, id))
    .returning();
  return row ?? null;
}

export async function deleteReview(id: number): Promise<boolean> {
  const [row] = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
  return Boolean(row);
}
