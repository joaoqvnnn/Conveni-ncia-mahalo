import { prisma } from "@/lib/db";
import ProductCard, { ProductCardData } from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    take: 4,
    orderBy: { salesCount: "desc" },
    include: { category: true },
  });

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
    <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Produtos em destaque
          </h2>
          <p className="text-gray-500 text-sm mt-1">Selecionados pela loja.</p>
        </div>
        <Link
          href="/produtos"
          className="text-sm font-medium inline-flex items-center gap-1.5 border-b border-black pb-0.5 hover:gap-2.5 transition-all"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((p) => (
          <div key={p.id} className="relative">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
