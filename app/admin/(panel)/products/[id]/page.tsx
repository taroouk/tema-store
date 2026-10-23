import { notFound } from "next/navigation";
import { SubmitButton, ConfirmButton } from "@/components/admin/form-controls";
import { z } from "zod";

import {
  Badge,
  Card,
  inputCls,
  PageHeader,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { archiveProduct, updateProduct, updateStock } from "../actions";
import { ProductForm, type ProductFormValues } from "../product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("catalog:write");
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

  const initial: ProductFormValues = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    price: Number(product.price),
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
    sizes: [...new Set(product.variants.map((v) => v.size))],
  };

  return (
    <>
      <PageHeader
        title={product.name}
        description={`/${product.slug}`}
        actions={
          <form action={archiveProduct.bind(null, id)}>
            <ConfirmButton title="Archive this product?" message="It will be hidden from the storefront. Existing orders keep their history." confirmLabel="Archive">Archive</ConfirmButton>
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
