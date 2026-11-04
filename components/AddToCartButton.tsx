"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({
  id,
  name,
  price,
  stock,
}: {
  id: string;
  name: string;
  price: number;
  stock: number;
}) {
  const [added, setAdded] = useState(false);

  function handle() {
    if (stock <= 0) return;
    // Módulo 3 vai trocar isso pelo carrinho real.
    const raw = localStorage.getItem("conv:cart");
    const cart = raw ? JSON.parse(raw) : [];
    const existing = cart.find((i: any) => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, qty: 1 });
    localStorage.setItem("conv:cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      onClick={handle}
      disabled={stock <= 0}
      className="flex-1 bg-black text-white text-sm font-medium py-3 flex items-center justify-center gap-2 hover:bg-black/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      <Plus size={16} />
      {stock <= 0 ? "SEM ESTOQUE" : added ? "ADICIONADO" : "ADICIONAR AO CARRINHO"}
    </button>
  );
}
