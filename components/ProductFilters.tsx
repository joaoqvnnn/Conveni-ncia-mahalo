"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

type Cat = { name: string; slug: string };

export default function ProductFilters({
  categories,
  current,
}: {
  categories: Cat[];
  current: { categoria?: string; ordenar?: string; q?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(current.q || "");

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return `/produtos?${next.toString()}`;
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref({ q: q || undefined }));
  }

  const sortOptions = [
    { key: "recentes", label: "Mais recentes" },
    { key: "menor-preco", label: "Menor preço" },
    { key: "maior-preco", label: "Maior preço" },
    { key: "mais-vendidos", label: "Mais vendidos" },
    { key: "promocao", label: "Em promoção" },
  ];

  return (
    <div className="space-y-4 border-y border-gray-200 py-4">
      <form onSubmit={onSearch} className="flex items-center gap-2">
        <div className="flex-1 flex items-center border border-gray-200 px-3">
          <Search size={16} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 px-2 py-2 text-sm outline-none"
          />
        </div>
        <button className="bg-black text-white text-sm px-4 py-2 hover:bg-black/90">
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ categoria: undefined })}
          className={`text-xs px-3 py-1.5 border transition-colors ${
            !current.categoria
              ? "bg-black text-white border-black"
              : "border-gray-300 hover:border-black"
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={buildHref({ categoria: c.slug })}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              current.categoria === c.slug
                ? "bg-black text-white border-black"
                : "border-gray-300 hover:border-black"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 mr-1">Ordenar:</span>
        {sortOptions.map((o) => (
          <Link
            key={o.key}
            href={buildHref({ ordenar: o.key })}
            className={`text-xs px-2.5 py-1 border transition-colors ${
              current.ordenar === o.key
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-700 hover:border-black"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
