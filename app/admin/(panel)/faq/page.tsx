import { ConfirmButton, SubmitButton } from "@/components/admin/form-controls";
import { Badge, Card, Field, inputCls, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { PLACEHOLDER_HELP } from "@/lib/content/placeholders";
import { prisma } from "@/lib/prisma/client";

import { createFaq, deleteFaq, updateFaq } from "./actions";

export const metadata = { title: "FAQ" };

export default async function FaqAdmin() {
  await requireAdmin("catalog:write");
  const items = await prisma.faqItem.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });

  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions shown on the FAQ page (also used for Google rich results). Lower numbers appear first."
      />
      <div className="space-y-4">
        {items.map((f) => (
          <details key={f.id} className="rounded-lg border border-neutral-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm">
              <span className="font-medium">
                <span className="mr-3 text-neutral-400">{f.position}</span>
                {f.question}
              </span>
              <Badge tone={f.isActive ? "green" : "gray"}>{f.isActive ? "shown" : "hidden"}</Badge>
            </summary>
            <div className="border-t border-neutral-200 p-5">
              <form action={updateFaq.bind(null, f.id)} className="space-y-4">
                <Field label="Question"><input name="question" required defaultValue={f.question} className={inputCls} /></Field>
                <Field label="Answer"><textarea name="answer" required rows={4} defaultValue={f.answer} className={inputCls} /></Field>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="text-sm">
                    Order{" "}
                    <input name="position" type="number" min={0} defaultValue={f.position} className={`${inputCls} ml-2 inline-block w-24`} />
                  </label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={f.isActive} /> Show on the site</label>
                </div>
                <SubmitButton>Save</SubmitButton>
              </form>
              <form action={deleteFaq.bind(null, f.id)} className="mt-3">
                <ConfirmButton title="Delete this question?" message="It will disappear from the FAQ page." confirmLabel="Delete">Delete</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
            No questions saved yet — the site is showing the built-in defaults. Add one below, or run <code>npm run db:seed:content</code> to load the defaults here so you can edit them.
          </p>
        )}

        <Card title="Add a question">
          <form action={createFaq} className="space-y-4">
            <Field label="Question"><input name="question" required className={inputCls} /></Field>
            <Field label="Answer" hint={`Tokens: ${PLACEHOLDER_HELP.map((k) => `{{${k}}}`).join("  ")}`}>
              <textarea name="answer" required rows={4} className={inputCls} />
            </Field>
            <label className="text-sm">
              Order (optional){" "}
              <input name="position" type="number" min={0} className={`${inputCls} ml-2 inline-block w-24`} />
            </label>
            <input type="hidden" name="isActive" value="on" />
            <div><SubmitButton>Add question</SubmitButton></div>
          </form>
        </Card>
      </div>
    </>
  );
}
