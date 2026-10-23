import Link from "next/link";

import { btnCls } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-neutral-200 bg-white p-8 text-center">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-neutral-500">That record doesn&apos;t exist or was removed.</p>
      <Link href="/admin" className={`${btnCls} mt-6`}>
        Back to dashboard
      </Link>
    </div>
  );
}
