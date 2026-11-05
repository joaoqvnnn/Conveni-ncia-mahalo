import { prisma } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, DollarSign, Package, Users, AlertCircle } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    ordersToday,
    revenueToday,
    pendingCount,
    productCount,
    customerCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfDay }, status: { in: ["PAGO", "EM_PREPARACAO", "SAIU_ENTREGA", "ENTREGUE"] } },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { status: { in: ["AGUARDANDO_CONFIRMACAO", "AGUARDANDO_PAGAMENTO"] } },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.customer.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const cards = [
    { label: "Pedidos hoje", value: ordersToday, icon: ShoppingBag },
    { label: "Faturamento hoje", value: brl(Number(revenueToday._sum.total || 0)), icon: DollarSign },
    { label: "Aguardando", value: pendingCount, icon: AlertCircle },
    { label: "Produtos ativos", value: productCount, icon: Package },
    { label: "Clientes", value: customerCount, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Visão geral</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                {c.label}
              </span>
              <c.icon size={16} className="text-gray-400" />
            </div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-base font-bold mb-3">Pedidos recentes</h2>
      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">Sem pedidos.</div>
        ) : (
          recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/pedidos/${o.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium">#{o.number} — {o.customerName}</p>
                <p className="text-xs text-gray-500">
                  {o.createdAt.toLocaleString("pt-BR")} · {o.status}
                </p>
              </div>
              <span className="text-sm font-bold">{brl(Number(o.total))}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
