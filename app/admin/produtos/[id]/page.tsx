import { prisma } from "@/lib/db";
import { saveProductAction } from "@/app/actions/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductFormPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "novo";
  const [product, categories] = await Promise.all([
    isNew
      ? Promise.resolve(null)
      : prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!isNew && !product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Novo produto" : "Editar produto"}
      </h1>

      <form
        action={saveProductAction}
        className="bg-white border border-gray-200 p-5 space-y-3 max-w-2xl"
      >
        {product && <input type="hidden" name="id" value={product.id} />}

        <Field label="Nome" name="name" required defaultValue={product?.name} />
        <Field
          label="Descrição"
          name="description"
          as="textarea"
          defaultValue={product?.description}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Preço (R$)"
            name="price"
            required
            defaultValue={product ? String(product.price) : ""}
          />
          <Field
            label="Preço antigo (opcional)"
            name="oldPrice"
            defaultValue={product?.oldPrice ? String(product.oldPrice) : ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Estoque"
            name="stock"
            required
            defaultValue={String(product?.stock ?? 0)}
          />
          <div>
            <label className="block text-xs text-gray-600 mb-1">Categoria</label>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Field
          label="URL da imagem (opcional)"
          name="imageUrl"
          defaultValue={product?.imageUrl || ""}
          placeholder="https://..."
        />

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="accent-black"
            />
            Destaque na home
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product ? product.active : true}
              className="accent-black"
            />
            Ativo (visível no site)
          </label>
        </div>

        <button className="bg-black text-white text-sm font-medium px-6 py-3 hover:bg-black/90 mt-4">
          SALVAR
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  as,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  as?: "textarea";
  placeholder?: string;
}) {
  const cls =
    "w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black";
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {as === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue || ""}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue || ""}
          required={required}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
