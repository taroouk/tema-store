import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { BulkToolbar } from "@/components/admin/bulk-toolbar";
import { ConfirmButton, SubmitButton, TypedConfirmButton } from "@/components/admin/form-controls";
import {
  Badge,
  btnCls,
  btnGhostCls,
  ExportLink,
  inputCls,
  PageHeader,
  Pagination,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { money } from "@/lib/admin/format";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

import {
  archiveProduct,
  bulkDeleteProducts,
  bulkProducts,
  duplicateProduct,
  restoreProduct,
} from "./actions";

export const metadata = { title: "Products" };
const PAGE_SIZE = 20;

type Tab = "all" | "ACTIVE" | "DRAFT" | "ARCHIVED";
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "DRAFT", label: "Drafts" },
  { key: "ARCHIVED", label: "Archived" },
];

const menuItem = "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-neutral-100";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const admin = await requireAdmin("catalog:write");
  const canDelete = can(admin.role, "catalog:delete");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const tab: Tab = TABS.find((t) => t.key === sp.status)?.key ?? "all";

  const where = {
    ...(tab === "ARCHIVED"
      ? { status: "ARCHIVED" as const }
      : tab === "all"
        ? { deletedAt: null }
        : { status: tab, deletedAt: null }),
    ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" as const } } : {}),
  };

  const [products, total, active, draft, archived] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.product.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
  ]);
  const counts: Record<Tab, number> = { all: active + draft, ACTIVE: active, DRAFT: draft, ARCHIVED: archived };

  const backParams = new URLSearchParams();
  if (sp.q) backParams.set("q", sp.q);
  if (tab !== "all") backParams.set("status", tab);
  if (page > 1) backParams.set("page", String(page));
  const back = `/admin/products${backParams.size ? `?${backParams}` : ""}`;

  const isArchive = tab === "ARCHIVED";
  const link = (t: Tab) => `/admin/products${t === "all" && !sp.q ? "" : `?${new URLSearchParams({ ...(t !== "all" ? { status: t } : {}), ...(sp.q ? { q: sp.q } : {}) })}`}`;

  return (
    <>
      <PageHeader
        title="Products"
        description={`${counts.all} in your store · ${active} live`}
        actions={
          <>
            <ExportLink kind="products" />
            <Link href="/admin/products/new" className={btnCls}>New product</Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={link(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === t.key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            {t.label} <span className="text-xs text-neutral-500">{counts[t.key]}</span>
          </Link>
        ))}
      </div>

      <form className="mb-4 flex flex-wrap gap-2">
        {tab !== "all" && <input type="hidden" name="status" value={tab} />}
        <input name="q" defaultValue={sp.q} placeholder="Search by name…" className={`${inputCls} max-w-xs`} />
        <button className={btnGhostCls}>Search</button>
      </form>

      <form id="bulk-products">
        <input type="hidden" name="back" value={back} />

        <BulkToolbar formId="bulk-products">
          {isArchive ? (
            <SubmitButton className={btnGhostCls} formAction={bulkProducts.bind(null, "restore")}>Restore as drafts</SubmitButton>
          ) : (
            <>
              <SubmitButton className={btnGhostCls} formAction={bulkProducts.bind(null, "publish")}>Publish</SubmitButton>
              <SubmitButton className={btnGhostCls} formAction={bulkProducts.bind(null, "draft")}>Move to drafts</SubmitButton>
              <ConfirmButton
                title="Archive the selected products?"
                message="They are hidden from the store but kept, and can be restored any time. Past orders are not affected."
                confirmLabel="Archive"
                className={btnGhostCls}
                formAction={bulkProducts.bind(null, "archive")}
              >
                Archive
              </ConfirmButton>
            </>
          )}
          {canDelete && (isArchive || tab === "DRAFT") && (
            <TypedConfirmButton
              title="Permanently delete the selected products?"
              message="This cannot be undone. Their variants, photos are removed; past orders keep their own copy of the item. Live products are skipped — archive them first."
              formAction={bulkDeleteProducts}
            >
              Delete permanently
            </TypedConfirmButton>
          )}
        </BulkToolbar>

        <Table>
          <thead>
            <tr>
              <th className={`${th} w-10`}></th>
              <th className={th}>Product</th>
              <th className={th}>Category</th>
              <th className={th}>Price</th>
              <th className={th}>Stock</th>
              <th className={th}>Status</th>
              <th className={`${th} w-12`}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              const archivedRow = p.status === "ARCHIVED";
              return (
                <tr key={p.id} className={archivedRow ? "opacity-70" : undefined}>
                  <td className={td}>
                    <input type="checkbox" name="ids" value={p.id} aria-label={`Select ${p.name}`} />
                  </td>
                  <td className={td}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 text-[10px] text-neutral-500">no img</span>
                      )}
                      {p.name}
                    </Link>
                  </td>
                  <td className={td}>{p.category.name}</td>
                  <td className={td}>{money(p.price, p.currency)}</td>
                  <td className={td}>{stock === 0 ? <Badge tone="red">0</Badge> : stock}</td>
                  <td className={td}>
                    <Badge tone={p.status === "ACTIVE" ? "green" : p.status === "DRAFT" ? "amber" : "gray"}>{p.status.toLowerCase()}</Badge>
                  </td>
                  <td className={`${td} relative`}>
                    <details className="group relative">
                      <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md hover:bg-neutral-100" aria-label={`Actions for ${p.name}`}>
                        <MoreHorizontal size={16} />
                      </summary>
                      <div className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                        <Link href={`/admin/products/${p.id}`} className={menuItem}>Edit</Link>
                        <button type="submit" formAction={duplicateProduct.bind(null, p.id)} className={menuItem}>Duplicate</button>
                        {archivedRow ? (
                          <button type="submit" formAction={restoreProduct.bind(null, p.id)} className={menuItem}>Restore</button>
                        ) : (
                          <ConfirmButton
                            title={`Archive “${p.name}”?`}
                            message="It will be hidden from the store and can be restored any time."
                            confirmLabel="Archive"
                            className={`${menuItem} text-red-700`}
                            formAction={archiveProduct.bind(null, p.id)}
                          >
                            Archive
                          </ConfirmButton>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td className={`${td} py-12 text-center text-neutral-500`} colSpan={7}>
                  {sp.q ? "No products match your search." : isArchive ? "Nothing archived." : "No products yet — add your first one."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </form>
      <Pagination base="/admin/products" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q: sp.q, status: tab === "all" ? undefined : tab }} />
    </>
  );
}
