"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import * as Icons from "lucide-react";
import { useFavorites } from "./FavoritesProvider";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  stock: number;
  categoryName: string;
  categoryIcon: string;
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(product.id);

  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[
      product.categoryIcon
    ] || Icons.Package;

  return (
    <div className="border border-gray-200 hover:border-black transition-colors flex flex-col group">
      <Link
        href={`/produtos/${product.slug}`}
        className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Icon size={56} strokeWidth={1} />
        )}
        {product.oldPrice && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-medium px-2 py-1">
            OFERTA
          </span>
        )}
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label="Favoritar"
        className={`absolute top-2 right-2 p-1.5 bg-white border rounded-full transition-colors ${
          fav ? "border-black" : "border-gray-200 hover:border-black"
        }`}
        style={{ position: "absolute" }}
      >
        <Heart size={14} fill={fav ? "black" : "none"} />
      </button>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          {product.categoryName}
        </span>
        <Link
          href={`/produtos/${product.slug}`}
          className="text-sm font-medium leading-tight hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{brl(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              {brl(product.oldPrice)}
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <span className="text-xs text-gray-500 mt-1">Sem estoque</span>
        )}
        <button
          disabled={product.stock <= 0}
          className="mt-3 w-full bg-black text-white text-xs font-medium py-2 flex items-center justify-center gap-1.5 hover:bg-black/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
          ADICIONAR
        </button>
      </div>
    </div>
  );
}
