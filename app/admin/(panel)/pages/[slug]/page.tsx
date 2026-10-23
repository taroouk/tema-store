import { notFound } from "next/navigation";

import { ConfirmButton, SubmitButton } from "@/components/admin/form-controls";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { Card, Field, inputCls, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { PAGE_SLUGS, getContentPage } from "@/lib/content";
import { PLACEHOLDER_HELP } from "@/lib/content/placeholders";
import { prisma } from "@/lib/prisma/client";

import { resetPage, savePage } from "../actions";

export const metadata = { title: "Edit page" };

export default async function EditPageAdmin({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin("catalog:write");
  const { slug } = await params;
  if (!PAGE_SLUGS.includes(slug)) notFound();

  // Read straight from the database (not the cache) so the editor always shows the saved text.
  const row = await prisma.contentPage.findUnique({ where: { slug } });
  const page = row ?? (await getContentPage(slug));
  if (!page) notFound();

  return (
    <>
      <PageHeader
        title={page.title}
        description={`Live at /${slug}`}
        actions={
          <form action={resetPage.bind(null, slug)}>
            <ConfirmButton title="Restore the default text?" message="Your current text for this page will be replaced by the original version." confirmLabel="Restore">
              Restore default
            </ConfirmButton>
          </form>
        }
      />
      <form action={savePage.bind(null, slug)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Text">
            <MarkdownEditor name="body" defaultValue={page.body} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Page details">
            <div className="space-y-4">
              <Field label="Title"><input name="title" required defaultValue={page.title} className={inputCls} /></Field>
              <Field label="Search-engine description" hint="Shown in Google results (about 150 characters)">
                <textarea name="description" rows={3} maxLength={300} defaultValue={page.description} className={inputCls} />
              </Field>
            </div>
          </Card>
          <Card title="Writing tips">
            <ul className="list-disc space-y-1 pl-4 text-xs text-neutral-600">
              <li><code>## Heading</code> for a section, <code>**bold**</code>, <code>- item</code> for lists.</li>
              <li>The first paragraph becomes the intro under the title.</li>
              <li>These tokens are replaced automatically with your live settings:</li>
            </ul>
            <p className="mt-2 flex flex-wrap gap-1">
              {PLACEHOLDER_HELP.map((k) => (
                <code key={k} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">{`{{${k}}}`}</code>
              ))}
            </p>
          </Card>
          <SubmitButton className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50">
            Save &amp; publish
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
