import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addClient } from "./actions";

export default async function ClientsPage() {
  const session = await auth();
  const clients = await prisma.client.findMany({
    where: { userId: session!.user.id, archived: false },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { where: { status: { not: "DONE" } } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-[#7a5c1e]">💼 クライアント</h1>

      <form action={addClient} className="flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="クライアント名を追加"
          required
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#d4a94b]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#d4a94b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c49a3f]"
        >
          追加
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {clients.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
            クライアントがまだ登録されていません。
          </p>
        )}

        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">{client.name}</span>
            <span className="text-xs text-gray-400">
              未完了 {client.tasks.length} 件
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
