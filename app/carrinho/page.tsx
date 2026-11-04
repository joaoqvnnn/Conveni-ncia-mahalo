"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { Plus, Minus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CarrinhoPage() {
  const { items, remove, setQty, subtotal, clear } = useCart();

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
        Meu carrinho
      </h1>

      {items.length === 0 ? (
        <div className="border border-gray-200 py-20 text-center flex flex-col items-center gap-3">
          <ShoppingCart size={40} strokeWidth={1} className="text-gray-300" />
          <p className="text-sm text-gray-500">Seu carrinho está vazio.</p>
          <Link
            href="/produtos"
            className="mt-2 bg-black text-white text-sm px-5 py-2 hover:bg-black/90"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-gray-200 divide-y divide-gray-100">
            {items.map((i) => (
              <div key={i.id} className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {i.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400">foto</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{brl(i.price)} cada</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setQty(i.id, i.qty - 1)}
                      className="p-1 border border-gray-200 hover:border-black"
                      aria-label="Diminuir"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center">{i.qty}</span>
                    <button
                      onClick={() => setQty(i.id, i.qty + 1)}
                      disabled={i.qty >= i.stock}
                      className="p-1 border border-gray-200 hover:border-black disabled:opacity-30"
                      aria-label="Aumentar"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => remove(i.id)}
                      className="ml-3 p-1 text-gray-400 hover:text-black"
                      aria-label="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-bold shrink-0">
                  {brl(i.price * i.qty)}
                </div>
              </div>
            ))}
            <div className="p-4">
              <button
                onClick={clear}
                className="text-xs text-gray-500 hover:text-black underline"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          <div className="border border-gray-200 p-5 h-fit">
            <h2 className="text-sm font-bold mb-4">Resumo</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{brl(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Taxa de entrega será calculada no checkout.
            </p>
            <Link
              href="/checkout"
              className="w-full bg-black text-white text-sm font-medium py-3 flex items-center justify-center gap-2 hover:bg-black/90"
            >
              FINALIZAR PEDIDO
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/produtos"
              className="mt-3 block text-center text-sm border border-gray-300 py-3 hover:border-black"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
