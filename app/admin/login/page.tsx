import type { Metadata } from "next";

import { SubmitButton } from "@/components/admin/form-controls";
import { btnCls, inputCls } from "@/components/admin/ui";

import "../admin.css";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="admin-root flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-neutral-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-[0.12em]">Tema Label</p>
          <p className="mt-1 text-sm text-neutral-500">Admin console</p>
        </div>
        <form action={signIn} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="username" autoFocus className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input name="password" type="password" required autoComplete="current-password" className={`${inputCls} mt-1`} />
          </label>
          <SubmitButton className={`${btnCls} w-full`}>Sign in</SubmitButton>
        </form>
        <p className="mt-6 text-center text-xs text-neutral-500">Authorized personnel only.</p>
      </div>
    </main>
  );
}
