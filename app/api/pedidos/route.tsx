import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { store } from "@/lib/store";
import { getSession } from "@/lib/auth";

type Body = {
  name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip?: string;
  notes?: string;
  paymentMethod: "WHATSAPP" | "PIX" | "NA_ENTREGA";
  items: { id: string; qty: number }[];
};

function calcDeliveryFee(subtotal: number) {
  if (store.freeDeliveryAbove > 0 && subtotal >= store.freeDeliveryAbove) return 0;
  return store.deliveryFee;
}

export async function POST(req: Request) {
  // ==================== AUTH ====================
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login para finalizar a compra." },
      { status: 401 }
    );
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
  });
  if (!customer) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  // ==================== VALIDAÇÃO ====================
  const body: Body = await req.json();

  if (!body.name || !body.phone || !body.street || !body.number || !body.district || !body.city || !body.state) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  const ids = body.items.map((i) => i.id);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });

  if (products.length !== ids.length) {
    return NextResponse.json({ error: "Um ou mais produtos não estão mais disponíveis." }, { status: 400 });
  }

  let subtotal = 0;
  const orderItems: { productId: string; name: string; price: number; qty: number }[] = [];

  for (const it of body.items) {
    const p = products.find((x) => x.id === it.id)!;
    if (it.qty < 1 || it.qty > p.stock) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${p.name}. Disponível: ${p.stock}.` },
        { status: 400 }
      );
    }
    const price = Number(p.price);
    subtotal += price * it.qty;
    orderItems.push({ productId: p.id, name: p.name, price, qty: it.qty });
  }

  if (subtotal < store.minOrder) {
    return NextResponse.json(
      { error: `Pedido mínimo: ${store.minOrder.toFixed(2)}` },
      { status: 400 }
    );
  }

  // ==================== CÁLCULOS ====================
  const deliveryFee = calcDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const addressLine = `${body.street}, ${body.number}${
    body.complement ? " - " + body.complement : ""
  } - ${body.district}, ${body.city}/${body.state}${
    body.zip ? " - CEP " + body.zip : ""
  }`;

  // ==================== CRIA PEDIDO ====================
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      customerName: body.name,
      customerPhone: body.phone,
      address: addressLine,
      notes: body.notes || null,
      paymentMethod: body.paymentMethod,
      status:
        body.paymentMethod === "PIX"
          ? "AGUARDANDO_PAGAMENTO"
          : "AGUARDANDO_CONFIRMACAO",
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      items: {
        create: orderItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price.toFixed(2),
          qty: i.qty,
        })),
      },
    },
    include: { items: true },
  });

  // Abate estoque
  await Promise.all(
    orderItems.map((i) =>
      prisma.product.update({
        where: { id: i.productId },
        data: {
          stock: { decrement: i.qty },
          salesCount: { increment: i.qty },
        },
      })
    )
  );

  return NextResponse.json({
    order: {
      id: order.id,
      number: order.number,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      status: order.status,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        name: i.name,
        price: Number(i.price),
        qty: i.qty,
      })),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      notes: order.notes,
    },
  });
}
