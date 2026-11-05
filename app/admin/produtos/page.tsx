import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteProductAction } from "@/app/actions/admin";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-1.5 bg-black text-white text-sm px-4 py-2 hover:bg-black/90"
        >
          <Plus size={14} /> Novo produto
        </Link>
      </div>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {products.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            Nenhum produto cadastrado.
          </div>
        )}
        {products.map((p) => (
          <div key={p.id} className="grid grid-cols-6 gap-2 px-4 py-3 items-center">
            <div className="text-sm font-medium truncate col-span-2">{p.name}</div>
            <div className="text-xs text-gray-500">{p.category.name}</div>
            <div className="text-xs">Estoque: {p.stock}</div>
            <div className="text-sm font-bold">{brl(Number(p.price))}</div>
            <div className="flex gap-2 justify-end">
              <Link
                href={`/admin/produtos/${p.id}`}
                className="text-xs border border-gray-300 px-2 py-1 hover:border-black"
              >
                Editar
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteProductAction(p.id);
                }}
              >
                <button className="text-xs border border-red-200 text-red-600 px-2 py-1 hover:bg-red-50">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
