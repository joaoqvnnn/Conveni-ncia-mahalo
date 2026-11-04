"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { store } from "@/lib/store";
import { useFavorites } from "./FavoritesProvider";
import { useCart } from "./CartProvider";

const links = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/categorias", label: "Categorias" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/mais-vendidos", label: "Mais vendidos" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { ids } = useFavorites();
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">
            {store.name}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-gray-500">
            {store.tagline}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-700 hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          <Link
            href="/conta"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Minha conta"
          >
            <UserRound size={20} />
          </Link>
          <Link
            href="/favoritos"
            className="hidden sm:inline-flex relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Favoritos"
          >
            <Heart size={20} />
            {ids.length > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {ids.length}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-sm border-b border-gray-100 last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
