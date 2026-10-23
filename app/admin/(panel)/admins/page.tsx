import { Badge, btnCls, Card, Field, inputCls, PageHeader, Table, td, th } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/form-controls";
import { dateTime } from "@/lib/admin/format";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { createAdmin, updateAdmin } from "./actions";

export const metadata = { title: "Admins" };
const ROLES = Object.entries(ROLE_LABELS);

export default async function AdminsPage() {
  const me = await requireAdmin("admins:manage");
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageHeader title="Admins" description="Who can sign in and what they can do." />

      <Table>
        <thead>
          <tr>
            <th className={th}>Admin</th>
            <th className={th}>Role</th>
            <th className={th}>Active</th>
            <th className={th}>New password</th>
            <th className={th}>Added</th>
            <th className={th}></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td className={td}>
                <p className="font-medium">{a.name}{a.id === me.id && <Badge>you</Badge>}</p>
                <p className="text-xs text-neutral-500">{a.email}</p>
              </td>
              <td className={td} colSpan={0}>
                <form id={`f-${a.id}`} action={updateAdmin.bind(null, a.id)} />
                <select form={`f-${a.id}`} name="role" defaultValue={a.role} className={inputCls}>
                  {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </td>
              <td className={td}>
                <input form={`f-${a.id}`} type="checkbox" name="isActive" defaultChecked={a.isActive} />
              </td>
              <td className={td}>
                <input form={`f-${a.id}`} type="password" name="password" autoComplete="new-password" placeholder="leave empty" className={inputCls} />
              </td>
              <td className={td}>{dateTime(a.createdAt)}</td>
              <td className={td}>
                <button form={`f-${a.id}`} className={btnCls}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Card title="Add admin" className="mt-6 max-w-xl">
        <form action={createAdmin} className="space-y-4">
          <Field label="Name"><input name="name" required className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
          <Field label="Password" hint="At least 10 characters">
            <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label="Role">
            <select name="role" defaultValue="EDITOR" className={inputCls}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <SubmitButton>Create admin</SubmitButton>
        </form>
      </Card>

      <Card title="Roles" className="mt-6 max-w-xl">
        <ul className="space-y-1 text-sm text-neutral-700">
          <li><b>Super admin</b> — everything, including managing admins</li>
          <li><b>Admin</b> — catalog, orders, customers, activity log</li>
          <li><b>Editor</b> — products, inventory, collections</li>
          <li><b>Support</b> — orders and customers</li>
        </ul>
      </Card>
    </>
  );
}
