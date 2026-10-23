import { ConfirmButton, SubmitButton } from "@/components/admin/form-controls";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { CouponFields } from "./coupon-fields";
import { createCoupon, deleteCoupon, updateCoupon } from "./actions";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  await requireAdmin("marketing:manage");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <>
      <PageHeader title="Coupons" description="Discount codes customers can apply at checkout." />
      <div className="space-y-4">
        {coupons.map((c) => {
          const expired = c.endsAt && c.endsAt < now;
          const scheduled = c.startsAt && c.startsAt > now;
          const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
          const live = c.isActive && !expired && !scheduled && !exhausted;
          return (
            <details key={c.id} className="rounded-lg border border-neutral-200 bg-white">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
                <span className="font-mono font-semibold">{c.code}</span>
                <span className="text-neutral-600">
                  {c.type === "PERCENT" ? `${Number(c.value)}% off` : `EGP ${Number(c.value)} off`}
                  {c.minSubtotal ? ` · min EGP ${Number(c.minSubtotal)}` : ""}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-neutral-500">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""} used
                  </span>
                  <Badge tone={live ? "green" : expired || exhausted ? "red" : "gray"}>
                    {live ? "live" : expired ? "expired" : exhausted ? "used up" : scheduled ? "scheduled" : "off"}
                  </Badge>
                </span>
              </summary>
              <div className="border-t border-neutral-200 p-5">
                <form action={updateCoupon.bind(null, c.id)} className="space-y-4">
                  <CouponFields coupon={{ ...c, value: Number(c.value), minSubtotal: c.minSubtotal ? Number(c.minSubtotal) : null }} />
                  <SubmitButton>Save</SubmitButton>
                </form>
                <form action={deleteCoupon.bind(null, c.id)} className="mt-3">
                  <ConfirmButton title={`Delete ${c.code}?`} message="Past orders keep the code they used." confirmLabel="Delete">
                    Delete coupon
                  </ConfirmButton>
                </form>
              </div>
            </details>
          );
        })}
        {coupons.length === 0 && <p className="text-sm text-neutral-500">No coupons yet.</p>}
        <Card title="New coupon">
          <form action={createCoupon} className="space-y-4">
            <CouponFields />
            <SubmitButton>Create coupon</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
