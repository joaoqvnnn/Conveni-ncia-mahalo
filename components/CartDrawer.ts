"use client";

import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CartDrawer() {
  const { isOpen, closeCart, items, remove, setQty, subtotal, count } = useCart();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60]"
          onClick={closeCart}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <h2 className="text-base font-bold">Seu carrinho</h2>
            <span className="text-xs text-gray-500">({count})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
              <ShoppingCart size={40} strokeWidth={1} className="text-gray-300" />
              <p className="text-sm text-gray-500">
                Seu carrinho está vazio.
              </p>
              <Link
                href="/produtos"
                onClick={closeCart}
                className="mt-2 bg-black text-white text-sm px-5 py-2 hover:bg-black/90"
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((i) => (
                <li key={i.id} className="p-4 flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {i.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{brl(i.price)}</p>
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
                        className="ml-auto p-1 text-gray-400 hover:text-black"
                        aria-label="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold shrink-0">
                    {brl(i.price * i.qty)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-base font-bold">{brl(subtotal)}</span>
            </div>
            <Link
              href="/carrinho"
              onClick={closeCart}
              className="block text-center bg-black text-white text-sm font-medium py-3 hover:bg-black/90"
            >
              IR PARA O CARRINHO
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block text-center border border-black text-black text-sm font-medium py-3 hover:bg-gray-50"
            >
              FINALIZAR PEDIDO
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
