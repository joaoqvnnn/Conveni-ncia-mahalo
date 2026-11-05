"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { getSettings, setSetting } from "@/lib/settings";
import { registerWebhook, sendOrderTelegram } from "@/lib/telegram";

type ActionResult = { ok: boolean; error?: string; message?: string };

/* ============ LOGIN / LOGOUT ============ */

export async function adminLoginAction(
  _prev: any,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (
    email !== process.env.ADMIN_EMAIL?.toLowerCase() ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return { ok: false, error: "Credenciais inválidas." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* ============ PEDIDOS ============ */

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "EM_PREPARACAO"
        ? { deliveryConfirmedAt: new Date(), deliveryConfirmedBy: "ADMIN" }
        : {}),
    },
  });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true, message: "Status atualizado." };
}

/* ============ PRODUTOS ============ */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveProductAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Nome é obrigatório." };

  const rawPrice = String(formData.get("price") || "0").replace(",", ".");
  const rawOldPrice = String(formData.get("oldPrice") || "").replace(",", ".");

  const data = {
    name,
    slug: slugify(name),
    description: String(formData.get("description") || ""),
    price: Number(rawPrice) || 0,
    oldPrice: rawOldPrice ? Number(rawOldPrice) : null,
    imageUrl: String(formData.get("imageUrl") || "") || null,
    stock: parseInt(String(formData.get("stock") || "0"), 10) || 0,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    categoryId: String(formData.get("categoryId") || ""),
  };

  if (!data.categoryId) return { ok: false, error: "Selecione uma categoria." };

  try {
    if (id) {
      await prisma.product.update({ where: { id }, data });
    } else {
      await prisma.product.create({ data });
    }
  } catch (e: any) {
    if (e.code === "P2002")
      return { ok: false, error: "Já existe um produto com esse nome." };
    return { ok: false, error: "Erro ao salvar." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  redirect("/admin/produtos");
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { ok: true };
}

/* ============ CATEGORIAS ============ */

export async function saveCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Nome é obrigatório." };

  const data = {
    name,
    slug: slugify(name),
    icon: String(formData.get("icon") || "Package"),
    order: parseInt(String(formData.get("order") || "0"), 10) || 0,
  };

  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch (e: any) {
    if (e.code === "P2002")
      return { ok: false, error: "Já existe uma categoria com esse nome." };
    return { ok: false, error: "Erro ao salvar." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, message: "Categoria salva." };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0)
    return {
      ok: false,
      error: `Existem ${count} produto(s) nessa categoria. Mova-os antes.`,
    };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}

/* ============ CLIENTES ============ */

export async function banCustomerAction(
  customerId: string,
  reason: string
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.customer.update({
    where: { id: customerId },
    data: { banned: true, bannedReason: reason || null, bannedAt: new Date() },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${customerId}`);
  return { ok: true, message: "Cliente banido." };
}

export async function unbanCustomerAction(
  customerId: string
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.customer.update({
    where: { id: customerId },
    data: { banned: false, bannedReason: null, bannedAt: null },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${customerId}`);
  return { ok: true, message: "Cliente reativado." };
}

/* ============ CONFIGURAÇÕES ============ */

export async function saveSettingsAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const keys = [
    "storeName",
    "whatsapp",
    "hours",
    "region",
    "deliveryFee",
    "freeDeliveryAbove",
    "minOrder",
    "autoConfirmOrders",
    "telegramChatId",
  ];
  for (const k of keys) {
    if (formData.has(k)) {
      const v = String(formData.get(k) || "");
      await setSetting(k, v);
    }
  }
  // checkbox
  await setSetting(
    "autoConfirmOrders",
    formData.get("autoConfirmOrders") === "on" ? "true" : "false"
  );

  revalidatePath("/admin/config");
  return { ok: true, message: "Configurações salvas." };
}

export async function registerTelegramWebhookAction(): Promise<ActionResult> {
  await requireAdmin();
  const result = await registerWebhook();
  if (result?.ok) return { ok: true, message: "Webhook registrado com sucesso." };
  return {
    ok: false,
    error: "Falha ao registrar. Verifique TELEGRAM_BOT_TOKEN e o secret.",
  };
}

export async function testTelegramAction(): Promise<ActionResult> {
  await requireAdmin();
  const settings = await getSettings();
  const chatId = process.env.TELEGRAM_CHAT_ID || settings.telegramChatId;
  if (!chatId) return { ok: false, error: "Chat ID não configurado." };

  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ <b>Teste de integração</b>\nSeu bot está funcionando.",
        parse_mode: "HTML",
      }),
    }
  );
  const data = await res.json();
  if (!data.ok) return { ok: false, error: data.description || "Falha ao enviar." };
  return { ok: true, message: "Mensagem de teste enviada." };
}

/* ============ MANUAL: ENVIAR PARA TELEGRAM ============ */

export async function resendOrderToTelegramAction(
  orderId: string
): Promise<ActionResult> {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Pedido não encontrado." };

  const mode =
    order.status === "PAGO" || order.status === "EM_PREPARACAO"
      ? "confirmed"
      : order.status === "CANCELADO"
      ? "refused"
      : "pending";
  await sendOrderTelegram(order, mode);
  return { ok: true, message: "Enviado." };
}
