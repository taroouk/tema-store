import { Field, inputCls } from "@/components/admin/ui";

export function CollectionFields({
  products,
  collection,
}: {
  products: { id: string; name: string }[];
  collection?: {
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    position: number;
    isActive: boolean;
    productCollections: { productId: string }[];
  };
}) {
  const selected = new Set(collection?.productCollections.map((p) => p.productId));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required defaultValue={collection?.title} className={inputCls} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={collection?.slug} className={inputCls} />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={2} defaultValue={collection?.description} className={inputCls} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cover image URL">
          <input name="coverImage" defaultValue={collection?.coverImage ?? ""} className={inputCls} />
        </Field>
        <Field label="Position">
          <input name="position" type="number" min={0} defaultValue={collection?.position ?? 0} className={inputCls} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={collection?.isActive ?? true} /> Visible on storefront
      </label>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-neutral-700">Products</legend>
        <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border border-neutral-200 p-3 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="productIds" value={p.id} defaultChecked={selected.has(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
