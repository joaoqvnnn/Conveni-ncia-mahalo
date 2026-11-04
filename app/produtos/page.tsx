import { prisma } from "@/lib/db";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

type Search = {
  categoria?: string;
  ordenar?: string;
  q?: string;
};

export const dynamic = "force-dynamic";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const categoria = searchParams.categoria;
  const ordenar = searchParams.ordenar || "recentes";
  const q = searchParams.q;

  const where: any = { active: true };
  if (categoria) where.category = { slug: categoria };
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
  ];
  if (ordenar === "promocao") where.oldPrice = { not: null };

  const orderBy: any =
    ordenar === "menor-preco" ? { price: "asc" } :
    ordenar === "maior-preco" ? { price: "desc" } :
    ordenar === "mais-vendidos" ? { salesCount: "desc" } :
    { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const list: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    stock: p.stock,
    categoryName: p.category.name,
    categoryIcon: p.category.icon,
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Produtos
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {list.length} {list.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      <ProductFilters
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        current={{ categoria, ordenar, q }}
      />

      {list.length === 0 ? (
        <div className="border border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-500">
            Nenhum produto encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
