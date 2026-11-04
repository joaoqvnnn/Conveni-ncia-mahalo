import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { store } from "@/lib/store";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: { number: string };
}) {
  const num = parseInt(params.number, 10);
  if (isNaN(num)) notFound();

  const order = await prisma.order.findUnique({
    where: { number: num },
    include: { items: true },
  });

  if (!order) notFound();

  const statusMap: Record<string, string> = {
    AGUARDANDO_CONFIRMACAO: "Aguardando confirmação da loja",
    AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
    PAGO: "Pagamento aprovado",
    EM_PREPARACAO: "Em preparação",
    SAIU_ENTREGA: "Saiu para entrega",
    ENTREGUE: "Entregue",
    CANCELADO: "Cancelado",
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Pedido #{order.number} registrado
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {statusMap[order.status] || order.status}
        </p>
      </div>

      <div className="border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Itens
          </h2>
          <ul className="space-y-1.5 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>
                  {i.qty}x {i.name}
                </span>
                <span>{brl(Number(i.price) * i.qty)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{brl(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Entrega</span>
            <span>
              {Number(order.deliveryFee) === 0
                ? "Grátis"
                : brl(Number(order.deliveryFee))}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{brl(Number(order.total))}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 text-sm space-y-1">
          <p>
            <span className="text-gray-600">Nome: </span>
            {order.customerName}
          </p>
          <p>
            <span className="text-gray-600">Telefone: </span>
            {order.customerPhone}
          </p>
          <p>
            <span className="text-gray-600">Endereço: </span>
            {order.address}
          </p>
          {order.notes && (
            <p>
              <span className="text-gray-600">Observações: </span>
              {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
            `Olá! Sobre meu pedido #${order.number}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-black text-white text-sm font-medium py-3 flex items-center justify-center gap-2 hover:bg-black/90"
        >
          <MessageCircle size={16} />
          FALAR COM A LOJA
        </a>
        <Link
          href="/produtos"
          className="flex-1 border border-gray-300 text-sm font-medium py-3 text-center hover:border-black"
        >
          Continuar comprando
        </Link>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Guarde o número do seu pedido: <b>#{order.number}</b>
      </p>
    </section>
  );
}
