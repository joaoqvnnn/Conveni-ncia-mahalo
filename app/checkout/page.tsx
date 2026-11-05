"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { store } from "@/lib/store";
import { Loader2, ArrowRight } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "Paranavaí",
    state: "PR",
    zip: "",
    notes: "",
    paymentMethod: "WHATSAPP" as "WHATSAPP" | "PIX" | "NA_ENTREGA",
  });

  const fee =
    store.freeDeliveryAbove > 0 && subtotal >= store.freeDeliveryAbove
      ? 0
      : store.deliveryFee;
  const total = subtotal + fee;

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Carrinho vazio.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar pedido.");
        setLoading(false);
        return;
      }

      const order = data.order;

      // ===== PIX: redireciona para página de pagamento =====
      if (form.paymentMethod === "PIX") {
        clear();
        sessionStorage.setItem("conv:lastOrder", JSON.stringify(order));
        router.push(`/pagamento/${order.id}`);
        return;
      }

      // ===== WhatsApp / Na entrega: monta mensagem e abre WhatsApp =====
      const lines = [
        `*Novo pedido #${order.number}*`,
        "",
        "*Produtos:*",
        ...order.items.map(
          (i: any) => `• ${i.qty}x ${i.name} — ${brl(i.price * i.qty)}`
        ),
        "",
        `Subtotal: ${brl(order.subtotal)}`,
        `Entrega: ${order.deliveryFee === 0 ? "Grátis" : brl(order.deliveryFee)}`,
        `*Total: ${brl(order.total)}*`,
        "",
        `*Nome:* ${order.customerName}`,
        `*Telefone:* ${order.customerPhone}`,
        `*Endereço:* ${order.address}`,
        order.notes ? `*Observações:* ${order.notes}` : null,
        "",
        `*Pagamento:* ${
          order.paymentMethod === "PIX"
            ? "PIX"
            : order.paymentMethod === "NA_ENTREGA"
            ? "Na entrega"
            : "A combinar"
        }`,
      ].filter(Boolean);

      const text = encodeURIComponent(lines.join("\n"));
      const wa = `https://wa.me/${store.whatsapp}?text=${text}`;

      clear();
      sessionStorage.setItem("conv:lastOrder", JSON.stringify(order));
      window.open(wa, "_blank");
      router.push(`/pedido/${order.number}`);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Carrinho vazio</h1>
        <p className="text-sm text-gray-500 mb-6">
          Adicione produtos antes de finalizar o pedido.
        </p>
        <Link
          href="/produtos"
          className="inline-block bg-black text-white text-sm px-6 py-3 hover:bg-black/90"
        >
          Ver produtos
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
        Finalizar pedido
      </h1>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <fieldset className="border border-gray-200 p-5 space-y-3">
            <legend className="px-2 text-xs uppercase tracking-wider text-gray-500">
              Dados pessoais
            </legend>
            <input
              required
              placeholder="Nome completo *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              required
              placeholder="Telefone / WhatsApp *"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </fieldset>

          <fieldset className="border border-gray-200 p-5 space-y-3">
            <legend className="px-2 text-xs uppercase tracking-wider text-gray-500">
              Endereço de entrega
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                placeholder="Rua *"
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                className="col-span-2 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <input
                required
                placeholder="Número *"
                value={form.number}
                onChange={(e) => update("number", e.target.value)}
                className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
            <input
              placeholder="Complemento"
              value={form.complement}
              onChange={(e) => update("complement", e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              required
              placeholder="Bairro *"
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                placeholder="Cidade *"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <input
                required
                maxLength={2}
                placeholder="UF *"
                value={form.state}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
                className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <input
                placeholder="CEP"
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
                className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
            <textarea
              placeholder="Observações do pedido (ex: ponto de referência)"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
            />
          </fieldset>

          <fieldset className="border border-gray-200 p-5 space-y-3">
            <legend className="px-2 text-xs uppercase tracking-wider text-gray-500">
              Forma de pagamento
            </legend>
            {[
              { value: "WHATSAPP", label: "A combinar pelo WhatsApp" },
              { value: "PIX", label: "PIX (QR Code gerado após confirmar)" },
              { value: "NA_ENTREGA", label: "Pagar na entrega" },
            ].map((o) => (
              <label
                key={o.value}
                className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                  form.paymentMethod === o.value
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={o.value}
                  checked={form.paymentMethod === o.value}
                  onChange={() => update("paymentMethod", o.value as any)}
                  className="accent-black"
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <aside className="border border-gray-200 p-5 h-fit space-y-3">
          <h2 className="text-sm font-bold">Resumo do pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="text-gray-700 truncate">
                  {i.qty}x {i.name}
                </span>
                <span className="shrink-0">{brl(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Entrega</span>
              <span>{fee === 0 ? "Grátis" : brl(fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 mt-2">
              <span>Total</span>
              <span>{brl(total)}</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-black text-white text-sm font-medium py-3 flex items-center justify-center gap-2 hover:bg-black/90 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> ENVIANDO...
              </>
            ) : (
              <>
                CONFIRMAR PEDIDO <ArrowRight size={14} />
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            {form.paymentMethod === "PIX"
              ? "Ao confirmar, você será direcionado para a página do PIX com QR Code."
              : "Ao confirmar, seu pedido será registrado e você será direcionado ao WhatsApp para acompanhar a entrega."}
          </p>
        </aside>
      </form>
    </section>
  );
}
