import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  addClientTask,
  deleteClient,
  deleteClientTask,
  updateTaskStatus,
} from "../actions";

const STATUS_LABEL: Record<string, string> = {
  TODO: "未着手",
  DOING: "進行中",
  DONE: "完了",
};

const STATUS_ORDER = ["TODO", "DOING", "DONE"] as const;

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const client = await prisma.client.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!client || client.userId !== session!.user.id) {
    notFound();
  }

  const addTaskAction = addClientTask.bind(null, client.id);
  const deleteClientAction = deleteClient.bind(null, client.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#7a5c1e]">{client.name}</h1>
        <form action={deleteClientAction}>
          <button
            type="submit"
            className="text-xs text-gray-400 hover:text-red-400"
          >
            クライアントを削除
          </button>
        </form>
      </div>

      <form
        action={addTaskAction}
        className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          type="text"
          name="title"
          placeholder="タスクを追加"
          required
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#d4a94b]"
        />
        <input
          type="date"
          name="dueDate"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#d4a94b]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#d4a94b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c49a3f]"
        >
          追加
        </button>
      </form>

      {STATUS_ORDER.map((status) => {
        const tasks = client.tasks.filter((task) => task.status === status);
        if (tasks.length === 0) return null;

        return (
          <div key={status} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-500">
              {STATUS_LABEL[status]} ({tasks.length})
            </h2>
            {tasks.map((task) => {
              const deleteAction = deleteClientTask.bind(null, task.id);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div>
                    <p
                      className={`text-sm ${
                        task.status === "DONE"
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="mt-1 text-xs text-gray-400">
                        期限: {task.dueDate.toISOString().slice(0, 10)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {STATUS_ORDER.filter((s) => s !== task.status).map(
                      (nextStatus) => {
                        const updateAction = updateTaskStatus.bind(
                          null,
                          task.id,
                          nextStatus
                        );
                        return (
                          <form key={nextStatus} action={updateAction}>
                            <button
                              type="submit"
                              className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
                            >
                              {STATUS_LABEL[nextStatus]}へ
                            </button>
                          </form>
                        );
                      }
                    )}
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        aria-label="削除"
                        className="text-xs text-gray-300 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {client.tasks.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          タスクがまだありません。
        </p>
      )}
    </div>
  );
}
