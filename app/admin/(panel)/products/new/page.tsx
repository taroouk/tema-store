import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin("catalog:write");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader title="New product" />
      <ProductForm action={createProduct} categories={categories} />
    </>
  );
}
