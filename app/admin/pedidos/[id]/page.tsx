import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateOrderStatusAction, resendOrderToTelegramAction } from "@/app/actions/admin";

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

export default async function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const allStatuses = Object.keys(statusLabels);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pedido #{order.number}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {order.createdAt.toLocaleString("pt-BR")} · {statusLabels[order.status]}
        {order.deliveryConfirmedAt && (
          <> · Confirmado por {order.deliveryConfirmedBy}</>
        )}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-5 space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Itens</h2>
            <ul className="space-y-1.5 text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.qty}x {i.name}</span>
                  <span>{brl(Number(i.price) * i.qty)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-gray-100 pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{brl(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Entrega</span>
              <span>{brl(Number(order.deliveryFee))}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{brl(Number(order.total))}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 space-y-3">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Cliente</h2>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerPhone}</p>
            {order.customer && (
              <p className="text-xs text-gray-500 mt-1">ID: {order.customer.id}</p>
            )}
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Endereço</h2>
            <p className="text-sm">{order.address}</p>
          </div>
          {order.notes && (
            <div>
              <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Observações</h2>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
          <div>
            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Pagamento</h2>
            <p className="text-sm">{order.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 p-5">
        <h2 className="text-sm font-bold mb-3">Alterar status</h2>
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <form
              key={s}
              action={async () => {
                "use server";
                await updateOrderStatusAction(order.id, s);
              }}
            >
              <button
                className={`text-xs px-3 py-1.5 border ${
                  order.status === s
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                {statusLabels[s]}
              </button>
            </form>
          ))}
        </div>
        <form
          action={async () => {
            "use server";
            await resendOrderToTelegramAction(order.id);
          }}
          className="mt-4"
        >
          <button className="text-xs px-3 py-1.5 border border-gray-300 hover:border-black">
            Reenviar para o Telegram
          </button>
        </form>
      </div>
    </div>
  );
}
