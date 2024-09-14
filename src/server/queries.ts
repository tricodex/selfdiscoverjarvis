import 'server-only';
import { db } from '~/server/db';
import { getServerAuthSession } from "~/server/auth";
import { images } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getMyImages() {
  try {
    const session = await getServerAuthSession();

    if (!session || !session.user) {
      console.error("User not authenticated");
      return [];
    }

    const userImages = await db.query.images.findMany({
      where: eq(images.createdById, session.user.id),
    });

    return userImages;
  } catch (error) {
    console.error("Error fetching user images:", error);
    return [];
  }
}