import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchTodaySchedule } from "@/lib/timetree";
import { formatDateLabelJST, formatTimeJST } from "@/lib/date";

function greeting(hour: number) {
  if (hour < 11) return { emoji: "☀️", text: "おはようございます" };
  if (hour < 18) return { emoji: "🌤️", text: "こんにちは" };
  return { emoji: "🌙", text: "こんばんは" };
}

export default async function TodaySchedulePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
  });

  const now = new Date();
  const jstHour = Number(
    new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Tokyo",
    }).format(now)
  );
  const { emoji, text } = greeting(jstHour);
  const dateLabel = formatDateLabelJST(now);

  let events: Awaited<ReturnType<typeof fetchTodaySchedule>> = [];
  let errorMessage: string | null = null;

  if (user.timeTreeIcsUrl) {
    try {
      events = await fetchTodaySchedule(user.timeTreeIcsUrl);
    } catch {
      errorMessage =
        "TimeTreeの予定を取得できませんでした。ICSのURLが正しいか設定画面をご確認ください。";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdf6e3] to-[#d4a94b] p-6">
        <p className="text-lg font-bold text-[#5a4310]">
          {emoji} {text}
        </p>
        <p className="mt-1 text-sm text-[#5a4310]">{dateLabel}の予定です</p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-700">{dateLabel}</h2>
          <Link
            href="/settings"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ⚙️ 設定
          </Link>
        </div>

        {!user.timeTreeIcsUrl && (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            TimeTreeと連携すると、ここに今日の予定が表示されます。
            <Link href="/settings" className="ml-1 text-[#c49a3f] underline">
              設定画面
            </Link>
            からICSのURLを登録してください。
          </p>
        )}

        {errorMessage && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-500">
            {errorMessage}
          </p>
        )}

        {user.timeTreeIcsUrl && !errorMessage && events.length === 0 && (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            今日の予定はありません。
          </p>
        )}

        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div
              key={event.uid}
              className="rounded-2xl bg-[#dcf0f7] p-4"
            >
              <p className="flex items-center gap-1 text-sm font-semibold text-[#1c6f8c]">
                <span>🕐</span>
                {event.allDay
                  ? "終日"
                  : `${formatTimeJST(event.start)}〜${formatTimeJST(event.end)}`}
              </p>
              <p className="mt-1 font-medium text-gray-700">{event.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
