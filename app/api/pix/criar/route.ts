import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mpPayment, BASE_URL } from "@/lib/mercadopago";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (order.mpPaymentId) {
    return NextResponse.json({
      alreadyCreated: true,
      qrCode: order.pixQrCode,
      copiaECola: order.pixCopiaECola,
      expiresAt: order.pixExpiresAt,
    });
  }

  try {
    const result = await mpPayment.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido #${order.number} — Conveniência`,
        payment_method_id: "pix",
        payer: {
          email: "cliente@conveniencia.local",
          first_name: order.customerName.split(" ")[0] || "Cliente",
        },
        external_reference: order.id,
        notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      requestOptions: { idempotencyKey: `order-${order.id}` },
    });

    const tx = result.point_of_interaction?.transaction_data;

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: String(result.id),
        pixQrCode: tx?.qr_code_base64 || null,
        pixCopiaECola: tx?.qr_code || null,
        pixExpiresAt: result.date_of_expiration
          ? new Date(result.date_of_expiration)
          : null,
        status: "AGUARDANDO_PAGAMENTO",
      },
    });

    return NextResponse.json({
      qrCode: updated.pixQrCode,
      copiaECola: updated.pixCopiaECola,
      expiresAt: updated.pixExpiresAt,
    });
  } catch (err: any) {
    console.error("Erro ao criar PIX:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar o PIX. Tente novamente." },
      { status: 500 }
    );
  }
}
