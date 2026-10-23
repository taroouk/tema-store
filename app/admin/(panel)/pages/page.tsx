import Link from "next/link";

import { PageHeader, Table, td, th } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { DEFAULT_PAGES } from "@/lib/content/defaults";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Policy pages" };

export default async function PagesAdmin() {
  await requireAdmin("catalog:write");
  const rows = await prisma.contentPage.findMany();
  const byslug = new Map(rows.map((r) => [r.slug, r]));

  return (
    <>
      <PageHeader title="Policy pages" description="Edit the text of your policies. Changes go live immediately." />
      <Table>
        <thead>
          <tr><th className={th}>Page</th><th className={th}>Address</th><th className={th}>Last edited</th><th className={th}></th></tr>
        </thead>
        <tbody>
          {DEFAULT_PAGES.map((d) => {
            const row = byslug.get(d.slug);
            return (
              <tr key={d.slug}>
                <td className={td}><Link className="font-medium hover:underline" href={`/admin/pages/${d.slug}`}>{row?.title ?? d.title}</Link></td>
                <td className={`${td} font-mono text-xs`}>/{d.slug}</td>
                <td className={td}>{row ? dateTime(row.updatedAt) : "Default text"}</td>
                <td className={td}>
                  <Link className="text-sm underline underline-offset-4" href={`/admin/pages/${d.slug}`}>Edit</Link>
                  {" · "}
                  <a className="text-sm underline underline-offset-4" href={`/${d.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
