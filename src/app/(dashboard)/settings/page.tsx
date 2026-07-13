import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateIcsUrl } from "./actions";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-[#7a5c1e]">設定</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-700">TimeTree 連携</h2>
        <p className="mb-3 text-sm text-gray-500">
          TimeTreeアプリの対象カレンダーで「カレンダーの設定」→「エクスポート」から発行できる
          ICS(iCal)購読用URLを貼り付けてください。
        </p>
        <form action={updateIcsUrl} className="flex flex-col gap-3">
          <input
            type="url"
            name="icsUrl"
            defaultValue={user.timeTreeIcsUrl ?? ""}
            placeholder="https://timetreeapp.com/calendars/xxxxx.ics"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#d4a94b]"
          />
          <button
            type="submit"
            className="self-start rounded-xl bg-[#d4a94b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c49a3f]"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  );
}
