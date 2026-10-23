import { SubmitButton } from "@/components/admin/form-controls";
import { Card, Field, inputCls, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";

import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin("settings:manage");
  const s = await getSettings();

  return (
    <>
      <PageHeader title="Settings" description="Store details and shipping rules. Changes apply to checkout immediately." />
      <form action={saveSettings} className="max-w-3xl space-y-6">
        <Card title="Store">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store name"><input name="storeName" required defaultValue={s.storeName} className={inputCls} /></Field>
            <Field label="Support phone"><input name="supportPhone" defaultValue={s.supportPhone} className={inputCls} /></Field>
            <Field label="Support email"><input name="supportEmail" type="email" defaultValue={s.supportEmail} className={inputCls} /></Field>
            <Field label="Announcement bar text" hint="Leave empty to keep the default messages">
              <input name="announcement" maxLength={160} defaultValue={s.announcement} className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="Business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Commercial register no."><input name="commercialRegister" defaultValue={s.commercialRegister} className={inputCls} /></Field>
            <Field label="Tax card no."><input name="taxCardNumber" defaultValue={s.taxCardNumber} className={inputCls} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Business address" hint="Shown in the footer and on the Contact page">
              <input name="businessAddress" defaultValue={s.businessAddress} className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram"><input name="instagramUrl" placeholder="https://instagram.com/…" defaultValue={s.links.instagram} className={inputCls} /></Field>
            <Field label="Facebook"><input name="facebookUrl" placeholder="https://facebook.com/…" defaultValue={s.links.facebook} className={inputCls} /></Field>
            <Field label="TikTok"><input name="tiktokUrl" placeholder="https://tiktok.com/@…" defaultValue={s.links.tiktok} className={inputCls} /></Field>
            <Field label="X (Twitter)"><input name="xUrl" placeholder="https://x.com/…" defaultValue={s.links.x} className={inputCls} /></Field>
            <Field label="Pinterest"><input name="pinterestUrl" placeholder="https://pinterest.com/…" defaultValue={s.links.pinterest} className={inputCls} /></Field>
          </div>
        </Card>
        <Card title="Opening hours">
          <Field label="Store hours" hint="Shown on the Contact page, one line per row (e.g. Monday – Friday: 10:00 – 20:00)">
            <textarea name="storeHours" rows={4} maxLength={300} defaultValue={s.storeHours} placeholder={"Monday – Friday: 10:00 – 20:00\nSaturday: 12:00 – 22:00\nSunday: Closed"} className={inputCls} />
          </Field>
        </Card>
        <Card title="Search engines">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Search Console code" hint="From the “HTML tag” method: only the content=… value">
              <input name="googleVerification" defaultValue={s.googleVerification} className={inputCls} />
            </Field>
            <Field label="Bing Webmaster code" hint="From the “HTML meta tag” method: only the content=… value">
              <input name="bingVerification" defaultValue={s.bingVerification} className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="Shipping (EGP)">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Standard delivery fee"><input name="standardShippingFee" type="number" min={0} step="1" required defaultValue={s.standardShippingFee} className={inputCls} /></Field>
            <Field label="Express delivery fee"><input name="expressShippingFee" type="number" min={0} step="1" required defaultValue={s.expressShippingFee} className={inputCls} /></Field>
            <Field label="Free standard shipping from" hint="Order subtotal"><input name="freeShippingThreshold" type="number" min={0} step="1" required defaultValue={s.freeShippingThreshold} className={inputCls} /></Field>
          </div>
        </Card>
        <Card title="Payments">
          <div className="space-y-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="codEnabled" defaultChecked={s.payments.cod} /> Cash on delivery
            </label>

            <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="instapayEnabled" defaultChecked={s.payments.instapay.enabled} /> InstaPay (bank transfer)
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="InstaPay address (IPA)" hint="e.g. yourname@instapay"><input name="instapayHandle" defaultValue={s.payments.instapay.handle} className={inputCls} /></Field>
                <Field label="Account name shown to customers"><input name="instapayAccountName" defaultValue={s.payments.instapay.accountName} className={inputCls} /></Field>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="walletEnabled" defaultChecked={s.payments.wallet.enabled} /> Mobile wallet
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Provider" hint="e.g. Vodafone Cash, Orange Cash, Etisalat Cash"><input name="walletProvider" defaultValue={s.payments.wallet.provider} className={inputCls} /></Field>
                <Field label="Wallet number"><input name="walletNumber" inputMode="tel" defaultValue={s.payments.wallet.number} className={inputCls} /></Field>
              </div>
            </div>

            <Field label="Extra payment instructions" hint="Shown to customers who pay by transfer (optional)">
              <textarea name="paymentInstructions" rows={3} maxLength={500} defaultValue={s.payments.instructions} className={inputCls} />
            </Field>
            <Field label="Remind me about unconfirmed transfers after (hours)" hint="A daily reminder lists InstaPay/wallet orders still waiting for you to confirm the payment (needs the scheduled job in DEPLOYMENT.md). Nothing is cancelled automatically.">
              <input name="unpaidHoldHours" type="number" min={1} max={720} defaultValue={s.unpaidHoldHours} className={`${inputCls} max-w-[10rem]`} />
            </Field>
            <p className="text-xs text-neutral-500">
              Transfers are verified manually: customers send the money, enter the reference at checkout (and can upload a screenshot), then you confirm each payment from the order page.
            </p>
          </div>
        </Card>
        <SubmitButton>Save settings</SubmitButton>
      </form>
    </>
  );
}
