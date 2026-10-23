"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import type { PaymentConfig, PaymentMethodId } from "@/lib/pricing";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
        <p className="truncate font-mono text-sm font-medium" dir="ltr">
          {value}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard unavailable: the value is still visible to copy by hand */
          }
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 transition hover:border-foreground"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

/** Where to send the money, shown for InstaPay / wallet orders. */
export function PaymentInstructions({
  method,
  config,
  total,
}: {
  method: Exclude<PaymentMethodId, "cod">;
  config: PaymentConfig;
  total: number;
}) {
  const amount = `EGP ${total.toLocaleString("en-US")}`;

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 p-5">
      <p className="text-sm leading-7 text-neutral-600">
        Send exactly <strong className="text-foreground">{amount}</strong>
        {method === "instapay" ? " using InstaPay to:" : ` to our ${config.wallet.provider || "wallet"} number:`}
      </p>
      {method === "instapay" ? (
        <>
          <CopyField label="InstaPay address" value={config.instapay.handle} />
          {config.instapay.accountName && <CopyField label="Account name" value={config.instapay.accountName} />}
        </>
      ) : (
        <CopyField label={config.wallet.provider ? `${config.wallet.provider} number` : "Wallet number"} value={config.wallet.number} />
      )}
      <CopyField label="Amount" value={String(total)} />
      {config.instructions && <p className="text-sm text-neutral-600">{config.instructions}</p>}
      <p className="text-xs text-neutral-500">
        After sending, enter the reference number from your payment confirmation below. We confirm every transfer manually, then process your order.
      </p>
    </div>
  );
}
