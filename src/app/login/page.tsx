"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf3e3] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-[#7a5c1e]">
          ログイン
        </h1>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-600">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-[#d4a94b]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-600">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-[#d4a94b]"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-[#d4a94b] py-2 font-semibold text-white transition hover:bg-[#c49a3f] disabled:opacity-60"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
