import { ExportLink, PageHeader, Pagination, Table, td, th, Badge } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Subscribers" };
const PAGE_SIZE = 50;

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin("marketing:manage");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [subs, total] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.subscriber.count(),
  ]);

  return (
    <>
      <PageHeader title="Subscribers" description={`${total} newsletter subscribers`} actions={<ExportLink kind="subscribers" />} />
      <Table>
        <thead>
          <tr><th className={th}>Email</th><th className={th}>Source</th><th className={th}>Status</th><th className={th}>Subscribed</th></tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td className={td}>{s.email}</td>
              <td className={td}>{s.source}</td>
              <td className={td}><Badge tone={s.isActive ? "green" : "gray"}>{s.isActive ? "active" : "unsubscribed"}</Badge></td>
              <td className={td}>{dateTime(s.createdAt)}</td>
            </tr>
          ))}
          {subs.length === 0 && <tr><td className={`${td} py-8 text-center text-neutral-500`} colSpan={4}>No subscribers yet.</td></tr>}
        </tbody>
      </Table>
      <Pagination base="/admin/subscribers" page={page} pages={Math.ceil(total / PAGE_SIZE)} />
    </>
  );
}
