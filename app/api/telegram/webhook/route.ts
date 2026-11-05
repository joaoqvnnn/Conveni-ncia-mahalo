import { prisma } from "@/lib/db";
import { answerCallback, editMessage, formatOrderMessage } from "@/lib/telegram";
import { setSetting } from "@/lib/settings";

export async function POST(req: Request) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return new Response("unauthorized", { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  if (!update.callback_query) return Response.json({ ok: true });

  const cq = update.callback_query;
  const [prefix, action, orderId] = (cq.data || "").split(":");
  if (prefix !== "ord" || !orderId) return Response.json({ ok: true });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    await answerCallback(cq.id, "Pedido não encontrado.");
    return Response.json({ ok: true });
  }

  const messageInfo = cq.message;
  const chatId = messageInfo.chat.id;
  const messageId = messageInfo.message_id;

  try {
    if (action === "ok") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "EM_PREPARACAO",
          deliveryConfirmedAt: new Date(),
          deliveryConfirmedBy: "TELEGRAM",
        },
      });
      await answerCallback(cq.id, "Pedido confirmado!");
      await editMessage(
        chatId,
        messageId,
        formatOrderMessage({ ...order, status: "EM_PREPARACAO" }, "confirmed")
      );
    } else if (action === "no") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELADO",
          deliveryConfirmedAt: new Date(),
          deliveryConfirmedBy: "TELEGRAM",
        },
      });
      await answerCallback(cq.id, "Pedido recusado.");
      await editMessage(
        chatId,
        messageId,
        formatOrderMessage({ ...order, status: "CANCELADO" }, "refused")
      );
    } else if (action === "auto") {
      await setSetting("autoConfirmOrders", "true");
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "EM_PREPARACAO",
          deliveryConfirmedAt: new Date(),
          deliveryConfirmedBy: "AUTO",
        },
      });
      await answerCallback(cq.id, "Modo automático ativado para os próximos pedidos!");
      await editMessage(
        chatId,
        messageId,
        formatOrderMessage(
          { ...order, status: "EM_PREPARACAO" },
          "confirmed"
        ) +
          "\n\n<i>Modo automático agora está ATIVO para os próximos pedidos.</i>"
      );
    }
  } catch (err) {
    console.error("Telegram callback error:", err);
    await answerCallback(cq.id, "Erro ao processar. Tente novamente.");
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ ok: true });
}
