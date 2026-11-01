import { ConfirmButton } from "@/components/admin/form-controls";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { SubmitButton } from "@/components/admin/form-controls";
import { Badge, Card, Field, inputCls, orderTone, PageHeader, Table, td, th } from "@/components/admin/ui";
import { dateTime, money } from "@/lib/admin/format";
import { whatsappLink } from "@/lib/egypt";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { deleteCustomer, saveCustomerNotes } from "./actions";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("customers:view");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!customer) notFound();

  const valid = customer.orders.filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status));
  const spent = valid.reduce((n, o) => n + Number(o.total), 0);

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${dateTime(customer.createdAt)}`}
        actions={
          <form action={deleteCustomer.bind(null, customer.id)}>
            <ConfirmButton
              title={`Delete ${customer.name}?`}
              message="The customer record is removed permanently. Their orders stay in Orders with the name, phone and address they were placed with."
              confirmLabel="Delete"
            >
              Delete customer
            </ConfirmButton>
          </form>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><p className="text-sm text-neutral-500">Orders</p><p className="mt-1 text-2xl font-semibold">{customer.orders.length}</p></Card>
            <Card><p className="text-sm text-neutral-500">Total spent</p><p className="mt-1 text-2xl font-semibold">{money(spent)}</p></Card>
            <Card><p className="text-sm text-neutral-500">Avg. order</p><p className="mt-1 text-2xl font-semibold">{money(valid.length ? Math.round(spent / valid.length) : 0)}</p></Card>
          </div>
          <Table>
            <thead>
              <tr><th className={th}>Order</th><th className={th}>Date</th><th className={th}>Total</th><th className={th}>Status</th></tr>
            </thead>
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id}>
                  <td className={td}><Link className="font-medium hover:underline" href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                  <td className={td}>{dateTime(o.createdAt)}</td>
                  <td className={td}>{money(o.total, o.currency)}</td>
                  <td className={td}><Badge tone={orderTone[o.status]}>{o.status.toLowerCase()}</Badge></td>
                </tr>
              ))}
              {customer.orders.length === 0 && <tr><td className={`${td} py-8 text-center text-neutral-500`} colSpan={4}>No orders yet.</td></tr>}
            </tbody>
          </Table>
        </div>
        <div className="space-y-6">
          <Card title="Contact">
            <p className="text-sm">{customer.email ?? <span className="text-neutral-500">No email on file</span>}</p>
            <p className="text-sm text-neutral-600">{customer.phone ?? "No phone"}</p>
            {whatsappLink(customer.phone) && (
              <a href={whatsappLink(customer.phone)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline underline-offset-4">
                Message on WhatsApp
              </a>
            )}
          </Card>
          <Card title="Internal notes">
            <form action={saveCustomerNotes.bind(null, id)} className="space-y-3">
              <Field label="Notes"><textarea name="notes" rows={5} defaultValue={customer.notes ?? ""} className={inputCls} /></Field>
              <SubmitButton>Save notes</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
