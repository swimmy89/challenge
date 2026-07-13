"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateIcsUrl(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const rawUrl = formData.get("icsUrl");
  const icsUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timeTreeIcsUrl: icsUrl || null },
  });

  revalidatePath("/");
  revalidatePath("/settings");
}
