import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { NavTabs } from "./nav-tabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <NavTabs />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-full px-3 py-1 text-xs text-gray-400 hover:text-gray-600"
          >
            ログアウト
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
