"use client";

import { Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { btnCls, btnDangerCls } from "./ui";

/** Submit button that shows a spinner and disables itself while the server action runs. */
export function SubmitButton({
  children,
  className = btnCls,
  ...props
}: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button {...props} type="submit" disabled={pending || props.disabled} className={`${className} gap-2`}>
      {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Destructive action behind a confirmation dialog. Must live inside a <form>. */
export function ConfirmButton({
  children,
  title,
  message,
  confirmLabel = "Confirm",
  className = btnDangerCls,
  formAction,
}: {
  children: React.ReactNode;
  title: string;
  message: string;
  confirmLabel?: string;
  className?: string;
  /** Server action to run instead of the enclosing form's action (lets one form hold many actions). */
  formAction?: ComponentProps<"button">["formAction"];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(92vw,26rem)] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-neutral-600">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-3">
          <button
            type="button"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <SubmitButton formAction={formAction} className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {confirmLabel}
          </SubmitButton>
        </div>
      </dialog>
      <span ref={button} hidden />
    </>
  );
}

/** Turns ?ok= / ?error= redirect messages into toasts, then cleans the URL. */
export function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const error = params.get("error");

  useEffect(() => {
    if (!ok && !error) return;
    if (ok) toast.success(ok);
    if (error) toast.error(error);
    const next = new URLSearchParams(params.toString());
    next.delete("ok");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [ok, error, params, pathname, router]);

  return null;
}

/**
 * Irreversible action: the person must type the phrase (default DELETE) before the button unlocks.
 * Must live inside a <form>; the typed text posts as the `confirm` field.
 */
export function TypedConfirmButton({
  children,
  title,
  message,
  phrase = "DELETE",
  confirmLabel = "Delete permanently",
  className = btnDangerCls,
  formAction,
}: {
  children: React.ReactNode;
  title: string;
  message: string;
  phrase?: string;
  confirmLabel?: string;
  className?: string;
  formAction?: ComponentProps<"button">["formAction"];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setTyped("");
          dialog.current?.showModal();
        }}
      >
        {children}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(92vw,28rem)] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/50"
      >
        <div className="space-y-3 p-6">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-neutral-600">{message}</p>
          <label className="block text-sm font-medium">
            Type <code className="rounded bg-neutral-100 px-1.5 py-0.5">{phrase}</code> to confirm
            <input
              name="confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-3">
          <button type="button" className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100" onClick={() => dialog.current?.close()}>
            Cancel
          </button>
          <SubmitButton
            formAction={formAction}
            disabled={typed !== phrase}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
          >
            {confirmLabel}
          </SubmitButton>
        </div>
      </dialog>
    </>
  );
}
