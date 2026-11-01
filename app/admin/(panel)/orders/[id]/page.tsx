import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/form-controls";
import { z } from "zod";

import {
  Badge,
  btnCls,
  Card,
  Field,
  inputCls,
  orderTone,
  PageHeader,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { dateTime, money } from "@/lib/admin/format";
import { whatsappLink } from "@/lib/egypt";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { PrintButton } from "@/components/admin/print-button";

import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPayment, deleteOrder, rejectPayment, updateOrder } from "../actions";

export const metadata = { title: "Order" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("orders:manage");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [order, history] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    prisma.auditLog.findMany({ where: { entity: "Order", entityId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string>;
  const ORDER = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  const PAY = ["UNPAID", "AWAITING_VERIFICATION", "PAID", "REFUNDED", "FAILED"];
  const isTransfer = order.paymentMethod === "INSTAPAY" || order.paymentMethod === "WALLET";
  let proofUrl: string | null = null;
  if (order.paymentProof) {
    const { data } = await createAdminClient().storage.from("payment-proofs").createSignedUrl(order.paymentProof, 600);
    proofUrl = data?.signedUrl ?? null;
  }

  return (
    <>
      <PageHeader
        title={`Order #${order.number}`}
        description={dateTime(order.createdAt)}
        actions={
          <>
            <Badge tone={orderTone[order.status]}>{order.status.toLowerCase()}</Badge>
            <PrintButton />
            <form action={deleteOrder.bind(null, order.id)}>
              <ConfirmButton
                title={`Delete order #${order.number}?`}
                message="The order is removed permanently. Stock is returned to the shelf if the order was still open."
                confirmLabel="Delete"
              >
                Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Items">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Variant</th>
                  <th className={th}>Price</th>
                  <th className={th}>Qty</th>
                  <th className={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className={td}>{i.name}</td>
                    <td className={td}>
                      {i.color} / {i.size}
                    </td>
                    <td className={td}>{money(i.unitPrice, order.currency)}</td>
                    <td className={td}>{i.quantity}</td>
                    <td className={td}>{money(Number(i.unitPrice) * i.quantity, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal, order.currency)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{money(order.shippingFee, order.currency)}</dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd>-{money(order.discount, order.currency)}</dd></div>
              <div className="flex justify-between border-t pt-1 font-semibold"><dt>Total</dt><dd>{money(order.total, order.currency)}</dd></div>
            </dl>
          </Card>
          {isTransfer && (
            <Card title={`Payment · ${order.paymentMethod === "INSTAPAY" ? "InstaPay" : "Wallet"}`}>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-neutral-500">Status</dt><dd className="font-medium">{order.paymentStatus.replaceAll("_", " ").toLowerCase()}</dd></div>
                <div><dt className="text-neutral-500">Amount to match</dt><dd className="font-medium">{money(order.total, order.currency)}</dd></div>
                <div><dt className="text-neutral-500">Sent from</dt><dd className="font-mono">{order.paymentSender ?? "—"}</dd></div>
                <div><dt className="text-neutral-500">Reference</dt><dd className="font-mono">{order.paymentReference ?? "—"}</dd></div>
              </dl>
              {proofUrl ? (
                <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proofUrl} alt="Customer payment screenshot" className="max-h-80 rounded-lg border border-neutral-200 object-contain" />
                  <span className="mt-1 block text-xs text-neutral-500">Screenshot uploaded by the customer · opens full size</span>
                </a>
              ) : (
                <p className="mt-4 text-sm text-neutral-500">No screenshot uploaded.</p>
              )}
              {order.paymentStatus !== "PAID" && order.paymentStatus !== "REFUNDED" && (
                <div className="no-print mt-5 flex flex-wrap gap-2">
                  <form action={confirmPayment.bind(null, id)}><SubmitButton>Confirm payment received</SubmitButton></form>
                  {order.paymentStatus !== "FAILED" && (
                    <form action={rejectPayment.bind(null, id)}>
                      <ConfirmButton title="Mark payment as not received?" message="The order stays open so you can contact the customer. You can still confirm the payment later." confirmLabel="Not received">Not received</ConfirmButton>
                    </form>
                  )}
                </div>
              )}
            </Card>
          )}
          <Card title="Customer">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-neutral-600">{order.email ?? "No email (phone order)"}</p>
            <p className="text-sm text-neutral-600">
              <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
              {whatsappLink(order.phone, `Hi ${order.customerName}, about your Tema Label order #${order.number}`) && (
                <>
                  {" · "}
                  <a href={whatsappLink(order.phone, `Hi ${order.customerName}, about your Tema Label order #${order.number}`)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    WhatsApp
                  </a>
                </>
              )}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
              {[addr.address, addr.city, addr.governorate, addr.postalCode].filter(Boolean).join("\n")}
            </p>
            {order.notes && <p className="mt-3 text-sm italic text-neutral-600">“{order.notes}”</p>}
          </Card>
        </div>

        <div className="space-y-6">
        <Card title="Fulfilment" className="no-print">
          {/* key: when the server changes status/payment (e.g. "Confirm payment received"), the form must pick up the new values instead of keeping stale uncontrolled ones */}
          <form key={`${order.status}-${order.paymentStatus}-${order.updatedAt.getTime()}`} action={updateOrder.bind(null, id)} className="space-y-4">
            <Field label="Order status">
              <select name="status" defaultValue={order.status} className={inputCls}>
                {ORDER.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Payment status" hint={`Method: ${order.paymentMethod}`}>
              <select name="paymentStatus" defaultValue={order.paymentStatus} className={inputCls}>
                {PAY.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Internal note">
              <textarea name="internalNote" rows={4} defaultValue={order.internalNote ?? ""} className={inputCls} />
            </Field>
            <SubmitButton className={`${btnCls} w-full`}>Save</SubmitButton>
          </form>
        </Card>
        <Card title="Activity" className="no-print">
          {history.length === 0 ? (
            <p className="text-sm text-neutral-500">No changes yet.</p>
          ) : (
            <ol className="space-y-3 border-l border-neutral-200 pl-4">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p>{h.summary}</p>
                  <p className="text-xs text-neutral-500">{h.adminEmail} · {dateTime(h.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
        </div>
      </div>
    </>
  );
}
