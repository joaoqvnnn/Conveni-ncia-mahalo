"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/components/FavoritesProvider";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default function FavoritosPage() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/favoritos?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
        Meus favoritos
      </h1>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : products.length === 0 ? (
        <div className="border border-gray-200 py-20 text-center flex flex-col items-center gap-3">
          <Heart size={40} strokeWidth={1} className="text-gray-300" />
          <p className="text-sm text-gray-500">
            Você ainda não tem favoritos. Toque no coração de um produto para salvar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
