import { ConfirmButton, SubmitButton } from "@/components/admin/form-controls";
import { Card, Field, inputCls, PageHeader, Table, td, th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { createCategory, deleteCategory, updateCategory } from "./actions";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin("catalog:write");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Categories" description="Top-level groups used to organize the catalog." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Slug</th>
                <th className={th}>Products</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className={td}>
                    <form id={`c-${c.id}`} action={updateCategory.bind(null, c.id)} />
                    <input form={`c-${c.id}`} name="name" defaultValue={c.name} required className={inputCls} aria-label="Name" />
                  </td>
                  <td className={td}>
                    <input form={`c-${c.id}`} name="slug" defaultValue={c.slug} className={inputCls} aria-label="Slug" />
                  </td>
                  <td className={td}>{c._count.products}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <div className="flex justify-end gap-2">
                      <button form={`c-${c.id}`} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">
                        Save
                      </button>
                      <form action={deleteCategory.bind(null, c.id)}>
                        <ConfirmButton
                          title={`Delete “${c.name}”?`}
                          message="Only empty categories can be deleted."
                          confirmLabel="Delete"
                          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Card title="New category">
          <form action={createCategory} className="space-y-4">
            <Field label="Name"><input name="name" required className={inputCls} /></Field>
            <Field label="Slug" hint="Optional — generated from the name"><input name="slug" className={inputCls} /></Field>
            <SubmitButton>Create category</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
