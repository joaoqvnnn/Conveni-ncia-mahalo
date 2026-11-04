import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

export default async function ProdutoPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!p || !p.active) notFound();

  const Icon = (Icons as any)[p.category.icon] || Icons.Package;

  const related = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: p.id }, active: true },
    take: 4,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-xs text-gray-500 mb-6 flex gap-1">
        <Link href="/" className="hover:text-black">Início</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-black">Produtos</Link>
        <span>/</span>
        <Link
          href={`/produtos?categoria=${p.category.slug}`}
          className="hover:text-black"
        >
          {p.category.name}
        </Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-50 flex items-center justify-center border border-gray-200">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon size={120} strokeWidth={0.8} />
          )}
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            {p.category.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            {p.name}
          </h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {p.description}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{brl(Number(p.price))}</span>
            {p.oldPrice && (
              <span className="text-base text-gray-400 line-through">
                {brl(Number(p.oldPrice))}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {p.stock > 0 ? `${p.stock} em estoque` : "Sem estoque no momento"}
          </p>

          <div className="mt-6 flex gap-2">
            <AddToCartButton
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              stock={p.stock}
              imageUrl={p.imageUrl}
            />
            <FavoriteButton id={p.id} />
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-1.5">
            <p>• Entrega rápida na região</p>
            <p>• Pagamento via PIX ou combinado pelo WhatsApp</p>
            <p>• Compra protegida conforme a LGPD</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold tracking-tight mb-4">
            Mais em {p.category.name}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/produtos/${r.slug}`}
                className="border border-gray-200 hover:border-black p-4 flex flex-col gap-2 transition-colors"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon size={40} strokeWidth={1} />
                  )}
                </div>
                <span className="text-sm font-medium line-clamp-2">
                  {r.name}
                </span>
                <span className="text-sm font-bold">
                  {brl(Number(r.price))}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
