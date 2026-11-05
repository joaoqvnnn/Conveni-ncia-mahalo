import { getSettings } from "./settings";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const esc = (s: string | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type TelegramMode = "pending" | "auto" | "confirmed" | "refused";

export function formatOrderMessage(order: any, mode: TelegramMode = "pending") {
  const headers: Record<TelegramMode, string> = {
    pending: "🛒 <b>NOVO PEDIDO</b>",
    auto: "🛒 <b>NOVO PEDIDO — AUTO CONFIRMADO</b>",
    confirmed: "✅ <b>PEDIDO CONFIRMADO</b>",
    refused: "❌ <b>PEDIDO RECUSADO</b>",
  };

  const items = (order.items || [])
    .map(
      (i: any) =>
        `  • ${i.qty}x ${esc(i.name)} — ${brl(Number(i.price) * i.qty)}`
    )
    .join("\n");

  const pagamento =
    order.paymentMethod === "PIX"
      ? "PIX (pago)"
      : order.paymentMethod === "NA_ENTREGA"
      ? "Pagar na entrega"
      : "A combinar";

  return [
    headers[mode],
    "",
    `<b>Pedido:</b> #${order.number}`,
    `<b>Cliente:</b> ${esc(order.customerName)}`,
    `<b>Telefone:</b> ${esc(order.customerPhone)}`,
    `<b>Endereço:</b> ${esc(order.address)}`,
    order.notes ? `<b>Obs.:</b> ${esc(order.notes)}` : null,
    "",
    `<b>Itens:</b>\n${items}`,
    "",
    `<b>Subtotal:</b> ${brl(Number(order.subtotal))}`,
    `<b>Entrega:</b> ${
      Number(order.deliveryFee) === 0 ? "Grátis" : brl(Number(order.deliveryFee))
    }`,
    `<b>Total:</b> ${brl(Number(order.total))}`,
    "",
    `<b>Pagamento:</b> ${pagamento}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function orderKeyboard(orderId: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Confirmar", callback_data: `ord:ok:${orderId}` },
        { text: "❌ Recusar", callback_data: `ord:no:${orderId}` },
      ],
      [
        {
          text: "🔄 Confirmar + Ativar modo automático",
          callback_data: `ord:auto:${orderId}`,
        },
      ],
    ],
  };
}

async function tg(path: string, body: any) {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (err) {
    console.error("Telegram error:", err);
    return null;
  }
}

export async function sendOrderTelegram(order: any, mode: TelegramMode) {
  const settings = await getSettings();
  const chatId = process.env.TELEGRAM_CHAT_ID || settings.telegramChatId;
  if (!chatId) return;

  const payload: any = {
    chat_id: chatId,
    text: formatOrderMessage(order, mode),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (mode === "pending" || mode === "auto") {
    payload.reply_markup = orderKeyboard(order.id);
  }

  await tg("sendMessage", payload);
}

export async function answerCallback(callbackId: string, text: string) {
  await tg("answerCallbackQuery", { callback_query_id: callbackId, text });
}

export async function editMessage(
  chatId: string | number,
  messageId: number,
  text: string
) {
  await tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export async function registerWebhook() {
  const url = `${BASE}/api/telegram/webhook`;
  return tg("setWebhook", { url, secret_token: SECRET });
}
