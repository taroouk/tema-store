import { PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Activity log" };
const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin("audit:view");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <>
      <PageHeader title="Activity log" description="Every change made from the admin panel." />
      <Table>
        <thead>
          <tr>
            <th className={th}>When</th>
            <th className={th}>Admin</th>
            <th className={th}>Action</th>
            <th className={th}>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className={td}>{dateTime(l.createdAt)}</td>
              <td className={td}>{l.adminEmail}</td>
              <td className={td}>{l.entity} · {l.action}</td>
              <td className={td}>{l.summary}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td className={td} colSpan={4}>Nothing logged yet.</td></tr>}
        </tbody>
      </Table>
      <Pagination base="/admin/audit" page={page} pages={Math.ceil(total / PAGE_SIZE)} />
    </>
  );
}
