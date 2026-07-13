"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/generated/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function addClient(formData: FormData) {
  const userId = await requireUserId();
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim() === "") return;

  await prisma.client.create({ data: { userId, name: name.trim() } });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const userId = await requireUserId();
  const client = await prisma.client.findUniqueOrThrow({ where: { id } });
  if (client.userId !== userId) throw new Error("Forbidden");

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function addClientTask(clientId: string, formData: FormData) {
  const userId = await requireUserId();
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
  });
  if (client.userId !== userId) throw new Error("Forbidden");

  const title = formData.get("title");
  if (typeof title !== "string" || title.trim() === "") return;

  const rawDueDate = formData.get("dueDate");
  const dueDate =
    typeof rawDueDate === "string" && rawDueDate !== ""
      ? new Date(rawDueDate)
      : null;

  await prisma.clientTask.create({
    data: { userId, clientId, title: title.trim(), dueDate },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const userId = await requireUserId();
  const task = await prisma.clientTask.findUniqueOrThrow({
    where: { id: taskId },
  });
  if (task.userId !== userId) throw new Error("Forbidden");

  await prisma.clientTask.update({ where: { id: taskId }, data: { status } });
  revalidatePath(`/clients/${task.clientId}`);
}

export async function deleteClientTask(taskId: string) {
  const userId = await requireUserId();
  const task = await prisma.clientTask.findUniqueOrThrow({
    where: { id: taskId },
  });
  if (task.userId !== userId) throw new Error("Forbidden");

  await prisma.clientTask.delete({ where: { id: taskId } });
  revalidatePath(`/clients/${task.clientId}`);
}
