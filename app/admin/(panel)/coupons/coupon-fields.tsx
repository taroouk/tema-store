import { Field, inputCls } from "@/components/admin/ui";

const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function CouponFields({
  coupon,
}: {
  coupon?: {
    code: string;
    description: string | null;
    type: "PERCENT" | "FIXED";
    value: number;
    minSubtotal: number | null;
    maxUses: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Code"><input name="code" required defaultValue={coupon?.code} className={`${inputCls} uppercase`} /></Field>
        <Field label="Type">
          <select name="type" defaultValue={coupon?.type ?? "PERCENT"} className={inputCls}>
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount (EGP)</option>
          </select>
        </Field>
        <Field label="Value"><input name="value" type="number" step="0.01" min={0} required defaultValue={coupon?.value} className={inputCls} /></Field>
      </div>
      <Field label="Description (internal)"><input name="description" defaultValue={coupon?.description ?? ""} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum order (EGP)"><input name="minSubtotal" type="number" min={0} defaultValue={coupon?.minSubtotal ?? ""} className={inputCls} /></Field>
        <Field label="Max total uses" hint="Empty = unlimited"><input name="maxUses" type="number" min={1} defaultValue={coupon?.maxUses ?? ""} className={inputCls} /></Field>
        <Field label="Starts"><input name="startsAt" type="datetime-local" defaultValue={local(coupon?.startsAt ?? null)} className={inputCls} /></Field>
        <Field label="Ends"><input name="endsAt" type="datetime-local" defaultValue={local(coupon?.endsAt ?? null)} className={inputCls} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={coupon?.isActive ?? true} /> Active
      </label>
    </div>
  );
}
