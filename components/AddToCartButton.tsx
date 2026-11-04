"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCartButton({
  id,
  name,
  price,
  stock,
  imageUrl,
}: {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handle() {
    if (stock <= 0) return;
    add({ id, name, price, stock, imageUrl });
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
