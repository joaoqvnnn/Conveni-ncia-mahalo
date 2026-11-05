import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { Package, MapPin, LogOut, UserRound } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  AGUARDANDO_PAGAMENTO: "Aguardando PIX",
  PAGO: "Pagamento aprovado",
  EM_PREPARACAO: "Em preparação",
  SAIU_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });

  if (!customer) redirect("/entrar");

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Minha conta</h1>
          <p className="text-sm text-gray-600 mt-1">
            {customer.name} · {customer.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-2 hover:border-black">
            <LogOut size={14} /> Sair
          </button>
        </form>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Card icon={<UserRound size={20} />} title="Perfil" href="/conta/perfil" />
        <Card icon={<MapPin size={20} />} title="Endereços" href="/conta/enderecos" />
        <Card icon={<Package size={20} />} title="Pedidos" href="/conta/pedidos" />
      </div>

      <h2 className="text-lg font-bold mb-3">Últimos pedidos</h2>
      {customer.orders.length === 0 ? (
        <div className="border border-gray-200 py-12 text-center text-sm text-gray-500">
          Você ainda não fez nenhum pedido.
        </div>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-100">
          {customer.orders.slice(0, 5).map((o) => (
            <Link
              key={o.id}
              href={`/pedido/${o.number}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium">Pedido #{o.number}</p>
                <p className="text-xs text-gray-500">
                  {o.createdAt.toLocaleDateString("pt-BR")} ·{" "}
                  {statusLabel[o.status] || o.status}
                </p>
              </div>
              <span className="text-sm font-bold">{brl(Number(o.total))}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Card({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border border-gray-200 p-4 hover:border-black transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
}
