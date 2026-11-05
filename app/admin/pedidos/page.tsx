import { prisma } from "@/lib/db";
import Link from "next/link";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabels: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  AGUARDANDO_PAGAMENTO: "Aguardando PIX",
  PAGO: "Pago",
  EM_PREPARACAO: "Em preparação",
  SAIU_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const where = searchParams.status ? { status: searchParams.status } : {};
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/pedidos"
          className={`text-xs px-3 py-1.5 border ${
            !searchParams.status ? "bg-black text-white border-black" : "border-gray-300"
          }`}
        >
          Todos
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/pedidos?status=${key}`}
            className={`text-xs px-3 py-1.5 border ${
              searchParams.status === key
                ? "bg-black text-white border-black"
                : "border-gray-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">Nenhum pedido.</div>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/pedidos/${o.id}`}
              className="grid grid-cols-5 gap-2 px-4 py-3 hover:bg-gray-50 items-center"
            >
              <div className="text-sm font-bold">#{o.number}</div>
              <div className="text-sm truncate">{o.customerName}</div>
              <div className="text-xs text-gray-500">{statusLabels[o.status] || o.status}</div>
              <div className="text-xs text-gray-500">
                {o.createdAt.toLocaleDateString("pt-BR")}
              </div>
              <div className="text-sm font-bold text-right">{brl(Number(o.total))}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
