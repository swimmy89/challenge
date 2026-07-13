import { prisma } from "@/lib/prisma";
import { startOfTodayJST } from "@/lib/date";

/**
 * Returns today's todos, rolling forward any unfinished todos from previous
 * days by reassigning their `date` to today. This is how "carry over to the
 * next day" is implemented: lazily, the next time the list is viewed.
 */
export async function getTodosForToday(userId: string) {
  const today = startOfTodayJST();

  await prisma.todo.updateMany({
    where: { userId, done: false, date: { lt: today } },
    data: { date: today },
  });

  return prisma.todo.findMany({
    where: { userId, date: today },
    orderBy: [{ done: "asc" }, { createdAt: "asc" }],
  });
}
