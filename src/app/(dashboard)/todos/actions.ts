"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfTodayJST } from "@/lib/date";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function addTodo(formData: FormData) {
  const userId = await requireUserId();
  const content = formData.get("content");
  if (typeof content !== "string" || content.trim() === "") return;

  await prisma.todo.create({
    data: { userId, content: content.trim(), date: startOfTodayJST() },
  });

  revalidatePath("/todos");
}

export async function toggleTodo(id: string) {
  const userId = await requireUserId();
  const todo = await prisma.todo.findUniqueOrThrow({ where: { id } });
  if (todo.userId !== userId) throw new Error("Forbidden");

  await prisma.todo.update({
    where: { id },
    data: { done: !todo.done, doneAt: !todo.done ? new Date() : null },
  });

  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();
  const todo = await prisma.todo.findUniqueOrThrow({ where: { id } });
  if (todo.userId !== userId) throw new Error("Forbidden");

  await prisma.todo.delete({ where: { id } });
  revalidatePath("/todos");
}
