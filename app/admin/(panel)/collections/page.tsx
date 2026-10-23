import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { SubmitButton, ConfirmButton } from "@/components/admin/form-controls";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { createCollection, deleteCollection, updateCollection } from "./actions";
import { CollectionFields } from "./collection-fields";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  await requireAdmin("catalog:write");

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { position: "asc" },
      include: { productCollections: { select: { productId: true } } },
    }),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader title="Collections" description="Group products into curated collections." />

      <div className="space-y-4">
        {collections.map((c) => (
          <details key={c.id} className="rounded-lg border border-neutral-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium">
              <span>
                {c.title} <span className="ml-2 text-neutral-500">/{c.slug}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-neutral-500">{c.productCollections.length} products</span>
                <Badge tone={c.isActive ? "green" : "gray"}>{c.isActive ? "visible" : "hidden"}</Badge>
              </span>
            </summary>
            <div className="border-t border-neutral-200 p-5">
              <form action={updateCollection.bind(null, c.id)} className="space-y-4">
                <CollectionFields products={products} collection={c} />
                <SubmitButton>Save</SubmitButton>
              </form>
              <form action={deleteCollection.bind(null, c.id)} className="mt-3">
                <ConfirmButton title="Delete this collection?" message="Products stay in the catalog; only the grouping is removed." confirmLabel="Delete">Delete collection</ConfirmButton>
              </form>
            </div>
          </details>
        ))}

        <Card title="New collection">
          <form action={createCollection} className="space-y-4">
            <CollectionFields products={products} />
            <SubmitButton>Create collection</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
