import { auth } from "@/auth";
import { dateKeyJST } from "@/lib/date";
import { getTodosForToday } from "@/lib/todos";
import { addTodo, deleteTodo, toggleTodo } from "./actions";

export default async function TodosPage() {
  const session = await auth();
  const todos = await getTodosForToday(session!.user.id);
  const todayKey = dateKeyJST();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-[#7a5c1e]">✅ やること</h1>

      <form action={addTodo} className="flex gap-2">
        <input
          type="text"
          name="content"
          placeholder="今日やりたいことを追加"
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
        {todos.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">
            今日のやることはまだありません。
          </p>
        )}

        {todos.map((todo) => {
          const carriedOver = dateKeyJST(todo.createdAt) !== todayKey;
          const toggleAction = toggleTodo.bind(null, todo.id);
          const deleteAction = deleteTodo.bind(null, todo.id);

          return (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
              <form action={toggleAction}>
                <button
                  type="submit"
                  aria-label={todo.done ? "未完了に戻す" : "完了にする"}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
                    todo.done
                      ? "border-[#d4a94b] bg-[#d4a94b] text-white"
                      : "border-gray-300 text-transparent"
                  }`}
                >
                  ✓
                </button>
              </form>

              <div className="flex-1">
                <p
                  className={`text-sm ${
                    todo.done ? "text-gray-400 line-through" : "text-gray-700"
                  }`}
                >
                  {todo.content}
                </p>
                {carriedOver && !todo.done && (
                  <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-500">
                    繰越
                  </span>
                )}
              </div>

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
          );
        })}
      </div>
    </div>
  );
}
