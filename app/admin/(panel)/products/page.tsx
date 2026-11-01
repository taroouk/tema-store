import { Archive, ArrowDown, ArrowUp, ArrowUpDown, Copy, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { RowMenu } from "@/components/admin/row-menu";
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
  deleteProductPermanently,
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

const menuItem = "flex w-full items-center px-3.5 py-2 text-left text-sm text-neutral-800 transition hover:bg-neutral-100";
const menuIcon = "mr-2.5 shrink-0 text-neutral-500";

function SortTh({ label, href, active, dir }: { label: string; href: string; active: boolean; dir: "asc" | "desc" }) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={th} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <Link href={href} className={`inline-flex items-center gap-1.5 hover:text-neutral-900 ${active ? "text-neutral-900" : ""}`}>
        {label}
        <Icon size={13} className={active ? "" : "opacity-40"} />
      </Link>
    </th>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; sort?: string; dir?: string; category?: string }>;
}) {
  const admin = await requireAdmin("catalog:write");
  const canDelete = can(admin.role, "catalog:delete");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const tab: Tab = TABS.find((t) => t.key === sp.status)?.key ?? "all";

  const SORTS = ["created", "name", "category", "price", "stock", "status"] as const;
  type Sort = (typeof SORTS)[number];
  const sort: Sort = SORTS.find((x) => x === sp.sort) ?? "created";
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : sp.dir === "desc" ? "desc" : sort === "created" || sort === "stock" ? "desc" : "asc";
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
  const category = categories.find((c) => c.slug === sp.category);

  const where = {
    ...(tab === "ARCHIVED"
      ? { status: "ARCHIVED" as const }
      : tab === "all"
        ? { deletedAt: null }
        : { status: tab, deletedAt: null }),
    ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" as const } } : {}),
    ...(category ? { categoryId: category.id } : {}),
  };
  const dbOrder =
    sort === "name" ? { name: dir }
    : sort === "category" ? { category: { name: dir } }
    : sort === "price" ? { price: dir }
    : sort === "status" ? { status: dir }
    : { createdAt: dir };
  const include = {
    category: true,
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    variants: { select: { stock: true } },
  };
  const totalStock = (p: { variants: { stock: number }[] }) => p.variants.reduce((n, v) => n + v.stock, 0);

  const [products, total, active, draft, archived] = await Promise.all([
    // Stock is a sum over variants, so that one sort happens in memory (the catalog is small).
    sort === "stock"
      ? prisma.product.findMany({ where, include }).then((rows) =>
          rows.sort((a, b) => (dir === "asc" ? 1 : -1) * (totalStock(a) - totalStock(b))).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        )
      : prisma.product.findMany({ where, orderBy: dbOrder, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.product.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
  ]);
  const counts: Record<Tab, number> = { all: active + draft, ACTIVE: active, DRAFT: draft, ARCHIVED: archived };

  const backParams = new URLSearchParams();
  if (sp.q) backParams.set("q", sp.q);
  if (tab !== "all") backParams.set("status", tab);
  if (sp.sort) backParams.set("sort", sort);
  if (sp.dir) backParams.set("dir", dir);
  if (category) backParams.set("category", category.slug);
  if (page > 1) backParams.set("page", String(page));
  const back = `/admin/products${backParams.size ? `?${backParams}` : ""}`;

  const isArchive = tab === "ARCHIVED";
  const hrefFor = (over: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | undefined> = { q: sp.q, status: tab === "all" ? undefined : tab, sort: sp.sort, dir: sp.dir, category: category?.slug, ...over };
    for (const [k, v] of Object.entries(base)) if (v) params.set(k, v);
    return `/admin/products${params.size ? `?${params}` : ""}`;
  };
  const link = (t: Tab) => hrefFor({ status: t === "all" ? undefined : t });
  const sortHref = (key: Sort) => hrefFor({ sort: key, dir: sort === key ? (dir === "asc" ? "desc" : "asc") : key === "created" || key === "stock" ? "desc" : "asc" });

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
        {sp.dir && <input type="hidden" name="dir" value={dir} />}
        <input name="q" defaultValue={sp.q} placeholder="Search by name…" className={`${inputCls} max-w-xs`} />
        <select name="category" defaultValue={category?.slug ?? ""} aria-label="Category" className={`${inputCls} max-w-[12rem]`}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort ? sort : ""} aria-label="Sort by" className={`${inputCls} max-w-[12rem]`}>
          <option value="">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="price">Sort: Price</option>
          <option value="stock">Sort: Stock</option>
          <option value="status">Sort: Status</option>
        </select>
        <button className={btnGhostCls}>Apply</button>
        {(sp.q || category || sp.sort) && <Link href={hrefFor({ q: undefined, category: undefined, sort: undefined, dir: undefined })} className="self-center text-sm text-neutral-500 hover:underline">Reset</Link>}
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
          {canDelete && (
            <TypedConfirmButton
              title="Permanently delete the selected products?"
              message="This cannot be undone. Their sizes and photos are removed from the database; past orders keep their own copy of the item."
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
              <SortTh label="Product" href={sortHref("name")} active={sort === "name"} dir={dir} />
              <SortTh label="Category" href={sortHref("category")} active={sort === "category"} dir={dir} />
              <SortTh label="Price" href={sortHref("price")} active={sort === "price"} dir={dir} />
              <SortTh label="Stock" href={sortHref("stock")} active={sort === "stock"} dir={dir} />
              <SortTh label="Status" href={sortHref("status")} active={sort === "status"} dir={dir} />
              <th className={`${th} w-12`}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = totalStock(p);
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
                    <RowMenu label={`Actions for ${p.name}`}>
                      <Link href={`/admin/products/${p.id}`} className={menuItem}>
                        <Pencil size={15} className={menuIcon} /> Edit
                      </Link>
                      <button type="submit" formAction={duplicateProduct.bind(null, p.id)} className={menuItem}>
                        <Copy size={15} className={menuIcon} /> Duplicate
                      </button>
                      {archivedRow ? (
                        <button type="submit" formAction={restoreProduct.bind(null, p.id)} className={menuItem}>
                          <RotateCcw size={15} className={menuIcon} /> Restore
                        </button>
                      ) : (
                        <ConfirmButton
                          title={`Archive “${p.name}”?`}
                          message="It will be hidden from the store and can be restored any time."
                          confirmLabel="Archive"
                          className={menuItem}
                          formAction={archiveProduct.bind(null, p.id)}
                        >
                          <Archive size={15} className={menuIcon} /> Archive
                        </ConfirmButton>
                      )}
                      {canDelete && (
                        <>
                          <div className="my-1 border-t border-neutral-200" />
                          <TypedConfirmButton
                            title={`Permanently delete “${p.name}”?`}
                            message="This cannot be undone. Its sizes and photos are removed from the database. Past orders keep their own copy of the item."
                            formAction={deleteProductPermanently.bind(null, p.id)}
                            className={`${menuItem} text-red-600 hover:bg-red-50`}
                          >
                            <Trash2 size={15} className="mr-2.5 shrink-0" /> Delete permanently
                          </TypedConfirmButton>
                        </>
                      )}
                    </RowMenu>
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
      <Pagination base="/admin/products" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q: sp.q, status: tab === "all" ? undefined : tab, sort: sp.sort, dir: sp.dir, category: category?.slug }} />
    </>
  );
}
