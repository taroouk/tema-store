"use client";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { SubmitButton } from "@/components/admin/form-controls";
import { btnCls, btnGhostCls, Card, Field, inputCls } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";

import { createUploadTicket } from "../uploads/actions";

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  material: string;
  careInstructions: string;
  metaTitle: string;
  metaDescription: string;
  price: number | "";
  compareAtPrice: number | "";
  costPrice: number | "";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  badge: string;
  featured: boolean;
  categoryId: string;
  images: { url: string; alt: string }[];
  colors: { name: string; hex: string }[];
  sizes: string[];
}

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  material: "",
  careInstructions: "",
  metaTitle: "",
  metaDescription: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  status: "DRAFT",
  badge: "",
  featured: false,
  categoryId: "",
  images: [],
  colors: [{ name: "Black", hex: "#000000" }],
  sizes: ["S", "M", "L", "XL"],
};

const COLOR_PRESETS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Beige", hex: "#D9C8B4" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Olive", hex: "#6B6B3A" },
  { name: "Grey", hex: "#8A8A8A" },
];
const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function ProductForm({
  action,
  categories,
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: { id: string; name: string }[];
  initial?: ProductFormValues;
}) {
  const editing = Boolean(initial);
  const [v, setV] = useState<ProductFormValues>(
    initial ?? { ...EMPTY, categoryId: categories[0]?.id ?? "" }
  );
  const [slugTouched, setSlugTouched] = useState(editing);
  const [uploading, setUploading] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValues>(k: K, value: ProductFormValues[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  const discount =
    v.price && v.compareAtPrice && Number(v.compareAtPrice) > Number(v.price)
      ? Math.round((1 - Number(v.price) / Number(v.compareAtPrice)) * 100)
      : 0;
  const margin =
    v.price && v.costPrice ? Math.round(((Number(v.price) - Number(v.costPrice)) / Number(v.price)) * 100) : null;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try {
        const ticket = await createUploadTicket(file.type, file.size);
        if (!ticket.ok) {
          toast.error(`${file.name}: ${ticket.error}`);
          continue;
        }
        const { error } = await supabase.storage
          .from("products")
          .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
        if (error) {
          toast.error(`${file.name}: upload failed`);
          continue;
        }
        setV((prev) => ({
          ...prev,
          images: [...prev.images, { url: ticket.publicUrl, alt: prev.name }],
        }));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  const moveImage = (i: number, dir: -1 | 1) =>
    setV((prev) => {
      const images = [...prev.images];
      const j = i + dir;
      if (j < 0 || j >= images.length) return prev;
      [images[i], images[j]] = [images[j], images[i]];
      return { ...prev, images };
    });

  const addSize = (raw: string) => {
    const size = raw.trim().toUpperCase();
    if (size && !v.sizes.includes(size)) set("sizes", [...v.sizes, size]);
  };

  const combos = v.colors.length * v.sizes.length;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      {/* Serialized structured fields (parsed by the server action) */}
      <input type="hidden" name="images" value={v.images.map((i) => (i.alt ? `${i.url} | ${i.alt}` : i.url)).join("\n")} />
      <input type="hidden" name="colors" value={v.colors.filter((c) => c.name.trim()).map((c) => `${c.name.trim()} ${c.hex}`).join("\n")} />
      <input type="hidden" name="sizes" value={v.sizes.join(", ")} />

      <div className="space-y-6 lg:col-span-2">
        <Card title="General">
          <div className="space-y-4">
            <Field label="Name">
              <input
                name="name"
                required
                value={v.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                className={inputCls}
              />
            </Field>
            <Field label="URL slug" hint={`Storefront URL: /products/${v.slug || "…"}`}>
              <input
                name="slug"
                value={v.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea name="description" required rows={5} value={v.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Fabric & material" hint="Shown on the product page. Leave empty to hide the section. One point per line.">
              <textarea name="material" rows={3} value={v.material} onChange={(e) => set("material", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Care instructions" hint="One step per line. Leave empty to hide the section.">
              <textarea name="careInstructions" rows={4} value={v.careInstructions} onChange={(e) => set("careInstructions", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Search engines (optional)">
          <div className="space-y-4">
            <Field label="Page title" hint={`${v.metaTitle.length}/70 · leave empty to use the product name`}>
              <input name="metaTitle" maxLength={70} value={v.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Meta description" hint={`${v.metaDescription.length}/170 · leave empty to use the description`}>
              <textarea name="metaDescription" rows={2} maxLength={170} value={v.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Images">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {v.images.map((img, i) => (
              <div key={img.url} className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="aspect-[3/4] w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Main
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  <div className="flex">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 text-white disabled:opacity-30" aria-label="Move earlier">
                      <ArrowUp size={14} className="-rotate-90" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === v.images.length - 1} className="p-1 text-white disabled:opacity-30" aria-label="Move later">
                      <ArrowDown size={14} className="-rotate-90" />
                    </button>
                  </div>
                  <button type="button" onClick={() => set("images", v.images.filter((_, n) => n !== i))} className="p-1 text-white" aria-label="Remove image">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
            >
              {uploading > 0 ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
              {uploading > 0 ? "Uploading…" : "Add images"}
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
          <p className="mt-3 text-xs text-neutral-500">JPG, PNG, WebP or AVIF · up to 5 MB each · the first image is the main one.</p>
          <div className="mt-3 flex gap-2">
            <input
              id="image-url"
              placeholder="…or paste an image URL / path"
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const url = e.currentTarget.value.trim();
                if (/^(https?:\/\/|\/)/.test(url)) {
                  set("images", [...v.images, { url, alt: v.name }]);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </Card>

        <Card title="Variants">
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Colors</p>
              <div className="space-y-2">
                {v.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      aria-label="Color"
                      onChange={(e) => set("colors", v.colors.map((x, n) => (n === i ? { ...x, hex: e.target.value.toUpperCase() } : x)))}
                      className="h-9 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-0.5"
                    />
                    <input
                      value={c.name}
                      placeholder="Color name"
                      onChange={(e) => set("colors", v.colors.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)))}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => set("colors", v.colors.filter((_, n) => n !== i))} disabled={v.colors.length === 1} className="p-2 text-neutral-500 hover:text-red-600 disabled:opacity-30" aria-label="Remove color">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.filter((p) => !v.colors.some((c) => c.name === p.name)).map((p) => (
                  <button key={p.name} type="button" onClick={() => set("colors", [...v.colors, p])} className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100">
                    <span className="h-3 w-3 rounded-full border border-neutral-300" style={{ background: p.hex }} />
                    {p.name}
                  </button>
                ))}
                <button type="button" onClick={() => set("colors", [...v.colors, { name: "", hex: "#888888" }])} className="flex items-center gap-1 rounded-full border border-dashed border-neutral-400 px-2.5 py-1 text-xs hover:bg-neutral-100">
                  <Plus size={12} /> Custom
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...SIZE_PRESETS, ...v.sizes])].map((s) => {
                  const on = v.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("sizes", on ? v.sizes.filter((x) => x !== s) : [...v.sizes, s])}
                      className={`rounded-md border px-3 py-1.5 text-sm ${on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:bg-neutral-100"}`}
                    >
                      {s}
                    </button>
                  );
                })}
                <input
                  placeholder="+ custom"
                  className="w-24 rounded-md border border-dashed border-neutral-400 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    addSize(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>

            <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              {combos} variant{combos === 1 ? "" : "s"} ({v.colors.length} color{v.colors.length === 1 ? "" : "s"} × {v.sizes.length} size
              {v.sizes.length === 1 ? "" : "s"}).{" "}
              {editing
                ? "Stock of existing combinations is kept; removed combinations are deleted. Edit quantities in Inventory below."
                : "Set the starting quantity below."}
            </p>
            {!editing && (
              <Field label="Initial stock per variant">
                <input name="initialStock" type="number" min={0} defaultValue={0} className={`${inputCls} max-w-[10rem]`} />
              </Field>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Status">
          <div className="space-y-4">
            {editing ? (
            <Field label="Visibility">
              <select name="status" value={v.status} onChange={(e) => set("status", e.target.value as ProductFormValues["status"])} className={inputCls}>
                <option value="DRAFT">Draft — hidden</option>
                <option value="ACTIVE">Active — live on the store</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            ) : (
              <input type="hidden" name="status" value="DRAFT" />
            )}
            <Field label="Badge">
              <select name="badge" value={v.badge} onChange={(e) => set("badge", e.target.value)} className={inputCls}>
                <option value="">None</option>
                <option value="NEW">New</option>
                <option value="BEST_SELLER">Best seller</option>
                <option value="LIMITED">Limited</option>
                <option value="SOLD_OUT">Sold out</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured on storefront
            </label>
          </div>
        </Card>

        <Card title="Organization">
          <Field label="Category">
            <select name="categoryId" required value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </Card>

        <Card title="Pricing (EGP)">
          <div className="space-y-4">
            <Field label="Price">
              <input name="price" type="number" step="0.01" min={0} required value={v.price} onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Compare-at price" hint={discount ? `Shown as ${discount}% off` : "Original price, shown crossed out"}>
              <input name="compareAtPrice" type="number" step="0.01" min={0} value={v.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Cost price" hint={margin !== null ? `Margin: ${margin}%` : "Internal only"}>
              <input name="costPrice" type="number" step="0.01" min={0} value={v.costPrice} onChange={(e) => set("costPrice", e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
        </Card>

        {editing ? (
          <SubmitButton className={`${btnCls} w-full`}>Save changes</SubmitButton>
        ) : (
          <div className="space-y-2">
            <SubmitButton name="intent" value="publish" className={`${btnCls} w-full`}>Publish product</SubmitButton>
            <SubmitButton name="intent" value="draft" className={`${btnGhostCls} w-full`}>Save as draft</SubmitButton>
            <p className="text-center text-xs text-neutral-500">A draft stays hidden from the store until you publish it. Publishing needs at least one image.</p>
          </div>
        )}
      </div>
    </form>
  );
}
