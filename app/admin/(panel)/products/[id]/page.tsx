import { notFound } from "next/navigation";
import { sortSizes } from "@/lib/size-price";
import { ConfirmButton, SubmitButton, TypedConfirmButton } from "@/components/admin/form-controls";
import { z } from "zod";

import {
  Badge,
  btnGhostCls,
  Card,
  inputCls,
  PageHeader,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { archiveProduct, deleteProductPermanently, duplicateProduct, restoreProduct, updateProduct, updateStock } from "../actions";
import { ProductForm, type ProductFormValues } from "../product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin("catalog:write");
  const canDelete = can(admin.role, "catalog:delete");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  const archived = product.status === "ARCHIVED";

  const initial: ProductFormValues = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    price: Number(product.price),
    priceLarge: product.priceLarge ? Number(product.priceLarge) : "",
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : "",
    costPrice: product.costPrice ? Number(product.costPrice) : "",
    status: product.status,
    badge: product.badge ?? "",
    featured: product.featured,
    categoryId: product.categoryId,
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ url: i.url, alt: i.alt })),
    colors: [...new Map(product.variants.map((v) => [v.colorName, v.colorHex])).entries()].map(
      ([name, hex]) => ({ name, hex })
    ),
    sizes: sortSizes([...new Set(product.variants.map((v) => v.size))]),
  };

  return (
    <>
      <PageHeader
        title={product.name}
        description={`/${product.slug}`}
        actions={
          <form className="flex flex-wrap items-center gap-2">
            <SubmitButton className={btnGhostCls} formAction={duplicateProduct.bind(null, id)}>Duplicate</SubmitButton>
            {archived ? (
              <SubmitButton className={btnGhostCls} formAction={restoreProduct.bind(null, id)}>Restore</SubmitButton>
            ) : (
              <ConfirmButton
                title="Archive this product?"
                message="It will be hidden from the store but kept, and can be restored any time. Past orders keep their history."
                confirmLabel="Archive"
                formAction={archiveProduct.bind(null, id)}
              >
                Archive
              </ConfirmButton>
            )}
            {canDelete &&
              (product.status === "ACTIVE" ? (
                <span className="text-xs text-neutral-500" title="Archive it first to enable permanent deletion">Archive to enable delete</span>
              ) : (
                <TypedConfirmButton
                  title={`Permanently delete “${product.name}”?`}
                  message="This cannot be undone. Its variants, photos are removed. Past orders keep their own copy of the item."
                  formAction={deleteProductPermanently.bind(null, id)}
                >
                  Delete permanently
                </TypedConfirmButton>
              ))}
          </form>
        }
      />
      <ProductForm action={updateProduct.bind(null, id)} categories={categories} initial={initial} />

      <div className="mt-8">
        <Card title="Inventory">
          <form action={updateStock.bind(null, id)} className="space-y-4">
            <Table>
              <thead>
                <tr>
                  <th className={th}>SKU</th>
                  <th className={th}>Color</th>
                  <th className={th}>Size</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id}>
                    <td className={`${td} font-mono text-xs`}>{v.sku}</td>
                    <td className={td}>
                      <span
                        className="mr-2 inline-block h-3 w-3 rounded-full border border-neutral-300 align-middle"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      {v.colorName}
                    </td>
                    <td className={td}>{v.size}</td>
                    <td className={td}>
                      <input
                        name={`stock_${v.id}`}
                        type="number"
                        min={0}
                        defaultValue={v.stock}
                        className={`${inputCls} w-24`}
                      />
                    </td>
                    <td className={td}>
                      {v.stock === 0 ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : v.stock <= v.lowStockAt ? (
                        <Badge tone="amber">Low</Badge>
                      ) : (
                        <Badge tone="green">In stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <SubmitButton>Save stock</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
