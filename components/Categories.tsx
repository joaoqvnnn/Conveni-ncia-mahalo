import Link from "next/link";
import * as Icons from "lucide-react";
import { prisma } from "@/lib/db";

export default async function Categories() {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Categorias</h2>
        <p className="text-gray-500 text-sm mt-1">Navegue por tipo de produto.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cats.map((c) => {
          const Icon = (Icons as any)[c.icon] || Icons.Package;
          return (
            <Link
              key={c.id}
              href={`/produtos?categoria=${c.slug}`}
              className="group border border-gray-200 p-5 flex flex-col items-center gap-3 hover:border-black hover:bg-gray-50 transition-colors"
            >
              <Icon size={28} strokeWidth={1.5} />
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
