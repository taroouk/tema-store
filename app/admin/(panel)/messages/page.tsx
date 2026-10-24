import Link from "next/link";

import { SubmitButton } from "@/components/admin/form-controls";
import { Badge, btnGhostCls, PageHeader, Pagination } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/format";
import { whatsappLink } from "@/lib/egypt";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { setMessageStatus } from "./actions";

export const metadata = { title: "Messages" };
const PAGE_SIZE = 20;
const TABS = [
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "ARCHIVED", label: "Archived" },
] as const;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin("customers:view");
  const sp = await searchParams;
  const status = TABS.find((t) => t.key === sp.status)?.key ?? "NEW";
  const page = Math.max(1, Number(sp.page) || 1);

  const [messages, total, counts] = await Promise.all([
    prisma.contactMessage.findMany({ where: { status }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.contactMessage.count({ where: { status } }),
    prisma.contactMessage.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = new Map(counts.map((c) => [c.status, c._count]));

  return (
    <>
      <PageHeader title="Messages" description="Enquiries sent from the contact form." />
      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/messages?status=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${status === t.key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            {t.label} <span className="text-xs text-neutral-500">{countOf.get(t.key) ?? 0}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <article key={m.id} className="rounded-lg border border-neutral-200 bg-white p-5">
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-neutral-500">
                  {m.email && (
                    <a href={`mailto:${m.email}?subject=Re: your message to Tema Label`} className="hover:underline">{m.email}</a>
                  )}
                  {m.email && m.phone && " · "}
                  {m.phone && <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a>}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {m.status === "NEW" && <Badge tone="blue">new</Badge>}
                {dateTime(m.createdAt)}
              </div>
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{m.message}</p>
            <div className="mt-4 flex gap-2">
              {m.email && (
                <a href={`mailto:${m.email}?subject=Re: your message to Tema Label`} className={btnGhostCls}>Reply by email</a>
              )}
              {whatsappLink(m.phone, `Hi ${m.name}, this is Tema Label replying to your message.`) && (
                <a href={whatsappLink(m.phone, `Hi ${m.name}, this is Tema Label replying to your message.`)} target="_blank" rel="noopener noreferrer" className={btnGhostCls}>Reply on WhatsApp</a>
              )}
              {m.status !== "READ" && (
                <form action={setMessageStatus.bind(null, m.id, "READ")}><SubmitButton className={btnGhostCls}>Mark as read</SubmitButton></form>
              )}
              {m.status !== "ARCHIVED" && (
                <form action={setMessageStatus.bind(null, m.id, "ARCHIVED")}><SubmitButton className={btnGhostCls}>Archive</SubmitButton></form>
              )}
            </div>
          </article>
        ))}
        {messages.length === 0 && <p className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">No messages here.</p>}
      </div>
      <Pagination base="/admin/messages" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ status }} />
    </>
  );
}
