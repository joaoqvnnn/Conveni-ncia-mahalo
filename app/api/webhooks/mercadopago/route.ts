import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { mpPayment, MP_WEBHOOK_SECRET } from "@/lib/mercadopago";

function isValidSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  if (!MP_WEBHOOK_SECRET) return false;

  const parts = xSignature.split(",");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) return false;

  const ts = tsPart.split("=")[1];
  const v1 = v1Part.split("=")[1];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", MP_WEBHOOK_SECRET);
  hmac.update(manifest);
  const expected = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: true });
  }

  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ received: true });
  }

  const dataId = String(body.data.id);
  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";

  if (!isValidSignature(xSignature, xRequestId, dataId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Responde imediatamente (MP exige <22s). Processa async.
  processPayment(dataId).catch((err) =>
    console.error("Erro ao processar pagamento:", err)
  );

  return NextResponse.json({ received: true });
}

async function processPayment(paymentId: string) {
  const payment = await mpPayment.get({ id: paymentId });
  const status = payment.status;
  const externalRef = payment.external_reference;

  if (!externalRef) return;

  const order = await prisma.order.findUnique({
    where: { id: externalRef },
  });
  if (!order) return;

  // Idempotência: se já está PAGO, ignora
  if (order.status === "PAGO" || order.paidAt) return;

  if (status === "approved") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAGO",
        paidAt: new Date(),
        mpPaymentId: String(paymentId),
      },
    });
  } else if (status === "rejected" || status === "cancelled") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELADO" },
    });
  }
  // "pending" e "in_process" → mantém AGUARDANDO_PAGAMENTO
}
