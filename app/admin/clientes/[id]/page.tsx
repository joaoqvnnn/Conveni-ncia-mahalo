import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { banCustomerAction, unbanCustomerAction } from "@/app/actions/admin";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetail({
  params,
}: {
  params: { id: string };
}) {
  const c = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!c) notFound();

  const totalSpent = c.orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{c.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Cliente desde {c.createdAt.toLocaleDateString("pt-BR")}
        {c.banned && (
          <span className="ml-2 text-red-600 font-medium">· BANIDO</span>
        )}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-5 space-y-2 text-sm">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Dados pessoais
          </h2>
          <p><b>E-mail:</b> {c.email}</p>
          <p><b>CPF:</b> {c.cpf}</p>
          <p><b>Telefone:</b> {c.phone}</p>
          <p><b>Nascimento:</b> {c.birthDate.toLocaleDateString("pt-BR")}</p>
          <p><b>E-mail verificado:</b> {c.emailVerified ? "Sim" : "Não"}</p>
        </div>

        <div className="bg-white border border-gray-200 p-5 text-sm">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Resumo
          </h2>
          <p><b>Pedidos:</b> {c.orders.length}</p>
          <p><b>Gasto total:</b> {brl(totalSpent)}</p>
        </div>
      </div>

      {/* Banimento */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-bold mb-3">
          {c.banned ? "Cliente banido" : "Banir cliente"}
        </h2>
        {c.banned ? (
          <>
            {c.bannedReason && (
              <p className="text-xs text-gray-600 mb-3">
                Motivo: {c.bannedReason}
              </p>
            )}
            <form
              action={async () => {
                "use server";
                await unbanCustomerAction(c.id);
              }}
            >
              <button className="text-sm bg-black text-white px-4 py-2 hover:bg-black/90">
                Reativar cliente
              </button>
            </form>
          </>
        ) : (
          <form
            action={async (formData: FormData) => {
              "use server";
              await banCustomerAction(
                c.id,
                String(formData.get("reason") || "")
              );
            }}
            className="space-y-2"
          >
            <input
              name="reason"
              placeholder="Motivo (opcional)"
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <button className="text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700">
              Banir cliente
            </button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Cliente banido não consegue fazer login nem finalizar compras.
        </p>
      </div>

      {/* Histórico */}
      <h2 className="text-base font-bold mb-3">Histórico de pedidos</h2>
      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {c.orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Nenhum pedido.
          </div>
        ) : (
          c.orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/pedidos/${o.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium">#{o.number}</p>
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
