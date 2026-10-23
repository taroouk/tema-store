import { SubmitButton } from "@/components/admin/form-controls";
import { Card, Field, inputCls, PageHeader } from "@/components/admin/ui";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";

import { changePassword, updateProfile } from "./actions";

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const admin = await requireAdmin();

  return (
    <>
      <PageHeader title="My profile" description={`${admin.email} · ${ROLE_LABELS[admin.role]}`} />
      <div className="grid max-w-3xl gap-6">
        <Card title="Details">
          <form action={updateProfile} className="space-y-4">
            <Field label="Name"><input name="name" required defaultValue={admin.name} className={inputCls} /></Field>
            <Field label="Email" hint="Contact a super admin to change your email"><input value={admin.email} disabled className={inputCls} readOnly /></Field>
            <SubmitButton>Save</SubmitButton>
          </form>
        </Card>
        <Card title="Change password">
          <form action={changePassword} className="space-y-4">
            <Field label="Current password"><input name="current" type="password" required autoComplete="current-password" className={inputCls} /></Field>
            <Field label="New password" hint="At least 10 characters"><input name="next" type="password" required minLength={10} autoComplete="new-password" className={inputCls} /></Field>
            <Field label="Confirm new password"><input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={inputCls} /></Field>
            <SubmitButton>Update password</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
